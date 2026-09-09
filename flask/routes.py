import random
import re
from datetime import datetime, timezone, date
from flask import jsonify, request

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
