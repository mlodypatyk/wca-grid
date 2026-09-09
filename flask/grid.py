import random
import secrets

from data import data, categories


def new_seed():
    return secrets.token_urlsafe(8)

def generate_grid(categories, data, rng):
    weights = {
        'result': 15,
        'worlds_podium': 2,
        'cont_podium': 3,
        'comps': 1,
        'country': 4,
        'record': 2,
    }
    keys = weights.keys()
    categories_tree = {}
    for type in weights:
        categories_tree[type] = []
    for category in categories:
        cat_type, _ = category.split(':')
        categories_tree[cat_type].append(category)

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
                    for no_duplicate_category in ['cont_podium', 'comps', 'country', 'record']:
                        if cat_type == no_duplicate_category:
                            for category in categories_now:
                                if category.startswith(f'{no_duplicate_category}:'):
                                    should_break = True
                    if should_break:
                        break
                    categories_now.append(new_cat)
                    break
        vertical_categories = categories_now[:3]
        horizontal_categories = categories_now[3:6]
        for v in vertical_categories:
            for h in horizontal_categories:
                v_type, v_data = v.split(':')
                h_type, h_data = h.split(':')
                people_fit = data[v].intersection(data[h])
                if len(people_fit) < 5 or len(people_fit) > 50:
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
