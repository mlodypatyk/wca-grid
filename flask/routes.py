import random
import re
from datetime import datetime, timezone, date
from flask import jsonify, request
from iptocc import country_code
from psycopg2.extras import Json

from app import app
from db import mydb
from data import data, categories
from grid import new_seed, generate_grid, build_squares, build_grid

REFERENCE_DATE = date(2026, 3, 21)

@app.route('/api/get_grid')
def get_grid():
    seed = new_seed()
    v, h, squares = build_grid(seed)
    return jsonify({
        'v': v,
        'h': h,
        'squares': squares,
        'seed': seed,
    })

@app.route('/api/get_seeded_grid')
def get_seeded_grid():
    seed = request.args.get('seed', '')
    if re.fullmatch(r"[A-Za-z0-9_-]{5,32}", seed) is None:
        return jsonify({'error': 'invalid seed'}), 400

    cursor = mydb.cursor()
    cursor.execute(
        "select vertical_categories, horizontal_categories from seeded_puzzles where seed = %s",
        (seed,)
    )
    row = cursor.fetchone()

    if row is not None:
        v, h = row
        valid = all(c in categories for c in v + h)
    else:
        valid = False

    if row is None or not valid:
        v, h, _ = build_grid(seed)
    squares = build_squares(v, h, data)

    return jsonify({
        'v': v,
        'h': h,
        'squares': squares,
        'seed': seed,
    })

@app.route('/api/save_seeded_grid', methods=['POST'])
def save_seeded_grid():
    seed = request.args.get('seed', '')
    if re.fullmatch(r"[A-Za-z0-9_-]{5,32}", seed) is None:
        return jsonify({'error': 'invalid seed'}), 400

    v, h, _ = build_grid(seed)
    cursor = mydb.cursor()
    cursor.execute(
        "insert into seeded_puzzles (seed, vertical_categories, horizontal_categories) values (%s, %s, %s) on conflict (seed) do nothing",
        (seed, v, h)
    )
    mydb.commit()
    return jsonify({'ok': True})

@app.route('/api/get_daily_grid')
def get_daily_grid():
    date_str = request.args.get('date')
    if date_str:
        puzzle_date = date.fromisoformat(date_str)
    else:
        puzzle_date = datetime.now(timezone.utc).date()

    cursor = mydb.cursor()
    cursor.execute(
        "select puzzle_number, vertical_categories, horizontal_categories from daily_puzzles where puzzle_date = %s",
        (puzzle_date,)
    )
    row = cursor.fetchone()

    if row is None:
        puzzle_number = (puzzle_date - REFERENCE_DATE).days + 1
        seed = int(puzzle_date.strftime('%Y%m%d'))
        rng = random.Random(seed)
        v, h = generate_grid(categories, data, rng)
        cursor.execute(
            "insert into daily_puzzles (puzzle_date, puzzle_number, vertical_categories, horizontal_categories) values (%s, %s, %s, %s) on conflict (puzzle_date) do nothing",
            (puzzle_date, puzzle_number, v, h)
        )
        mydb.commit()
        cursor.execute(
            "select puzzle_number, vertical_categories, horizontal_categories from daily_puzzles where puzzle_date = %s",
            (puzzle_date,)
        )
        row = cursor.fetchone()

    puzzle_number, v, h = row
    squares = build_squares(v, h, data)
    return jsonify({
        'date': puzzle_date.isoformat(),
        'number': puzzle_number,
        'v': v,
        'h': h,
        'squares': squares,
    })

@app.route('/api/record_guess')
def record_guess():
    wca_id = request.args.get('wca_id')
    if re.fullmatch("\d{4}[A-Z]{4}\d{2}", wca_id) is None:
        return []
    cat1 = request.args.get('cat1')
    cat2 = request.args.get('cat2')
    if cat1 not in categories:
        return []
    if cat2 not in categories:
        return []

    if cat1 > cat2: #flip them so they are in the same order in the db always
        cat1, cat2 = cat2, cat1

    possible_people = data[cat1].intersection(data[cat2])
    if wca_id not in possible_people:
        return []

    guess_hits = 0
    guess_showings = 0
    cursor = mydb.cursor()
    for person_id in possible_people:
        query = f"select * from answer_frequencies where wca_id='{person_id}' and cat1='{cat1}' and cat2='{cat2}'"
        cursor.execute(query)
        results = cursor.fetchall()
        if len(results) == 0:
            showings = 1
            hits = 0
            if person_id == wca_id:
                hits += 1
                guess_hits = hits
                guess_showings = showings
            print(person_id, wca_id)
            cursor.execute(f"insert into answer_frequencies (wca_id, cat1, cat2, hits, showings) values ('{person_id}', '{cat1}', '{cat2}', {hits}, {showings})")
        elif len(results) == 1:
            _, _, _, _, hits, showings = results[0]
            showings += 1
            if person_id == wca_id:
                hits += 1
                guess_hits = hits
                guess_showings = showings
            cursor.execute(f"update answer_frequencies set showings={showings}, hits={hits} where wca_id='{person_id}' and cat1='{cat1}' and cat2='{cat2}'")
        else:
            pass # panic
    mydb.commit()
    return {'hits': guess_hits, 'showings': guess_showings}

def get_client_ip():
    forwarded_for = request.headers.get('X-Forwarded-For')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.headers.get('X-Real-IP') or request.remote_addr

@app.route('/api/submit_score', methods=['POST'])
def submit_score():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return jsonify({'error': 'invalid body'}), 400

    mode = body.get('mode')
    if mode not in ('daily', 'previous'):
        return jsonify({'error': 'invalid mode'}), 400

    game_state = body.get('game_state')
    if game_state not in ('win', 'lose'):
        return jsonify({'error': 'invalid game_state'}), 400

    score = body.get('score')
    if not isinstance(score, int) or isinstance(score, bool) or not 0 <= score <= 2000:
        return jsonify({'error': 'invalid score'}), 400

    guesses_remaining = body.get('guesses_remaining')
    if not isinstance(guesses_remaining, int) or isinstance(guesses_remaining, bool) or not 0 <= guesses_remaining <= 12:
        return jsonify({'error': 'invalid guesses_remaining'}), 400

    try:
        puzzle_date = date.fromisoformat(body.get('puzzle_date', ''))
    except (TypeError, ValueError):
        return jsonify({'error': 'invalid puzzle_date'}), 400

    puzzle_number = body.get('puzzle_number')
    if puzzle_number is not None and (not isinstance(puzzle_number, int) or isinstance(puzzle_number, bool)):
        return jsonify({'error': 'invalid puzzle_number'}), 400

    grid_state = body.get('grid_state')
    if not isinstance(grid_state, list) or len(grid_state) != 3 or any(not isinstance(row, list) or len(row) != 3 for row in grid_state):
        return jsonify({'error': 'invalid grid_state'}), 400

    ip = get_client_ip()
    country_iso2 = country_code(ip) if ip else None
    user_agent = (request.headers.get('User-Agent') or '')[:512]

    cursor = mydb.cursor()
    cursor.execute(
        "insert into grid_scores (game_state, score, guesses_remaining, mode, puzzle_date, puzzle_number, user_agent, country_iso2, grid_state) values (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
        (game_state, score, guesses_remaining, mode, puzzle_date, puzzle_number, user_agent, country_iso2, Json(grid_state))
    )
    mydb.commit()
    return jsonify({'ok': True})
