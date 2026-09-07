import pickle
import random
import re
import os
import secrets
import psycopg2
from datetime import datetime, timezone, date
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from psycopg2.extras import Json

REFERENCE_DATE = date(2026, 3, 21)

def new_seed():
    return secrets.token_urlsafe(8)

def generate_grid(categories, data, rng):
    weights = {
        'result': 10,
        'worlds_podium': 2,
        'cont_podium': 2,
        'comps': 1,
        'country': 3
    }
    keys = weights.keys()
    categories_tree = {}
    for type in weights:
        categories_tree[type] = []
    for category in categories:
        cat_type, _ = category.split(':')
        categories_tree[cat_type].append(category)

    print(categories_tree)
    vertical_categories = []
    horizontal_categories = []
    iteration = 1
    while True:
        perfect = True
        categories_now = []
        while len(categories_now) < 6:
            sum_of_weights = sum(list(weights.values()))
            weight = rng.random() * sum_of_weights
            cur_sum = 0
            for cat_type in keys:
                cur_sum += weights[cat_type]
                if cur_sum > weight:
                    new_cat = categories_tree[cat_type][rng.randint(0, len(categories_tree[cat_type])-1)]
                    if new_cat in categories_now:
                        break
                    if cat_type == 'result':
                        event = new_cat.split(' ')[1]
                        should_break = False
                        for category in categories_now:
                            if category.startswith('result: '+event):
                                should_break = True
                        if should_break:
                            break
                    should_break = False
                    for no_duplicate_catory in ['cont_podium', 'comps']:
                        if cat_type == no_duplicate_catory:
                            for category in categories_now:
                                if category.startswith(f'{no_duplicate_catory}:'):
                                    should_break = True
                    if should_break:
                        break
                    categories_now.append(new_cat)
                    break
        vertical_categories = categories_now[:3]
        horizontal_categories = categories_now[3:6]
        print(iteration, vertical_categories, horizontal_categories)
        for v in vertical_categories:
            for h in horizontal_categories:
                v_type, v_data = v.split(':')
                h_type, h_data = h.split(':')
                people_fit = data[v].intersection(data[h])
                if len(people_fit) < 5 or len(people_fit) > 30:
                    perfect = False
                if v_type == h_type:
                    if v_type == 'result':
                        _, v_event, _ = v_data.split(' ')
                        _, h_event, _ = h_data.split(' ')
                        if v_event == h_event:
                            perfect = False
                    if v_type == 'comps':
                        perfect = False
        if perfect:
            break
        iteration += 1
    return vertical_categories, horizontal_categories

app = Flask(__name__)
CORS(app)

def build_squares(v, h, data):
    return [
        [list(data[h_i].intersection(data[v_j])) for v_j in v]
        for h_i in h
    ]

def build_grid(seed):
    rng = random.Random(seed)
    v, h = generate_grid(categories, data, rng)
    squares = build_squares(v, h, data)
    return v, h, squares

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
        "select vertical_categories, horizontal_categories, squares from seeded_puzzles where seed = %s",
        (seed,)
    )
    row = cursor.fetchone()

    if row is not None:
        v, h, squares = row
    else:
        v, h, squares = build_grid(seed)

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

    v, h, squares = build_grid(seed)
    cursor = mydb.cursor()
    cursor.execute(
        "insert into seeded_puzzles (seed, vertical_categories, horizontal_categories, squares) values (%s, %s, %s, %s) on conflict (seed) do nothing",
        (seed, v, h, Json(squares))
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
        "select puzzle_number, vertical_categories, horizontal_categories, squares from daily_puzzles where puzzle_date = %s",
        (puzzle_date,)
    )
    row = cursor.fetchone()

    if row is None:
        puzzle_number = (puzzle_date - REFERENCE_DATE).days + 1
        seed = int(puzzle_date.strftime('%Y%m%d'))
        rng = random.Random(seed)
        v, h = generate_grid(categories, data, rng)
        squares = build_squares(v, h, data)
        cursor.execute(
            "insert into daily_puzzles (puzzle_date, puzzle_number, vertical_categories, horizontal_categories, squares) values (%s, %s, %s, %s, %s) on conflict (puzzle_date) do nothing",
            (puzzle_date, puzzle_number, v, h, Json(squares))
        )
        mydb.commit()
        cursor.execute(
            "select puzzle_number, vertical_categories, horizontal_categories, squares from daily_puzzles where puzzle_date = %s",
            (puzzle_date,)
        )
        row = cursor.fetchone()

    puzzle_number, v, h, squares = row
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

load_dotenv()
host = os.getenv('POSTGRES_HOST', 'localhost')
port = int(os.getenv('POSTGRES_PORT', '5432'))
user = os.getenv('POSTGRES_USER', 'user')
password = os.getenv('POSTGRES_PASS', '')
database = os.getenv('POSTGRES_DB', 'db')

mydb = psycopg2.connect(
    host=host,
    user=user,
    password=password,
    database=database,
    port=port
)

data = pickle.load(open('data.pickle', 'rb'))
categories = list(data.keys())

if __name__ == '__main__':
    app.run()
