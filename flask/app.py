import pickle
import random
from flask import Flask, jsonify
from flask_cors import CORS

def generate_grid(categories, data):
    weights = {
        'result': 10,
        'worlds_podium': 2,
        'cont_podium': 2,
        'comps': 1
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
            weight = random.random() * sum_of_weights
            cur_sum = 0
            for cat_type in keys:
                cur_sum += weights[cat_type]
                if cur_sum > weight:
                    new_cat = categories_tree[cat_type][random.randint(0, len(categories_tree[cat_type])-1)]
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
@app.route('/api/get_grid')
def get_grid():
    data = pickle.load(open('data.pickle', 'rb'))
    categories = list(data.keys())
    v, h = generate_grid(categories, data)
    return jsonify({
        'v': v, 
        'h': h,
        'v_people': [list(data[v[0]]), list(data[v[1]]), list(data[v[2]])],
        'h_people': [list(data[h[0]]), list(data[h[1]]), list(data[h[2]])],
    })

if __name__ == '__main__':
    app.run()