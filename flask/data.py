import pickle

data = pickle.load(open('data.pickle', 'rb'))
categories = list(data.keys())
