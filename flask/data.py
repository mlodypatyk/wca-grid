import json
import os
import pickle
import threading

_PICKLE_PATH = 'data.pickle'

_lock = threading.Lock()
_mtime = None
_data = None
_export_metadata = None


def _reload_if_needed():
    global _mtime, _data, _export_metadata
    mtime = os.path.getmtime(_PICKLE_PATH)
    if mtime == _mtime:
        return
    with _lock:
        mtime = os.path.getmtime(_PICKLE_PATH)
        if mtime == _mtime:
            return
        with open(_PICKLE_PATH, 'rb') as f:
            rawpickle = pickle.load(f)
        _data = rawpickle['categories']
        _export_metadata = json.loads(rawpickle['metadata'])
        _mtime = mtime


class _Data:
    def __getitem__(self, key):
        _reload_if_needed()
        return _data[key]

    def __contains__(self, key):
        _reload_if_needed()
        return key in _data

    def __iter__(self):
        _reload_if_needed()
        return iter(_data)

    def __len__(self):
        _reload_if_needed()
        return len(_data)

    def keys(self):
        _reload_if_needed()
        return _data.keys()


class _Categories:
    def __contains__(self, key):
        _reload_if_needed()
        return key in _data

    def __iter__(self):
        _reload_if_needed()
        return iter(_data.keys())

    def __len__(self):
        _reload_if_needed()
        return len(_data)

    def __getitem__(self, index):
        _reload_if_needed()
        return list(_data.keys())[index]


data = _Data()
categories = _Categories()


def get_export_metadata():
    _reload_if_needed()
    return _export_metadata
