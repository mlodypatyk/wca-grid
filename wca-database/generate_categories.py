from dotenv import load_dotenv
import mysql.connector
import os
from collections import defaultdict
import pickle
import time
import sys

if __name__ == '__main__':
    load_dotenv()
    host = os.getenv('SECRET_HOST', 'localhost')
    user = os.getenv('SECRET_USER', 'user')
    password = os.getenv('SECRET_PASSWORD', '')
    database = os.getenv('SECRET_DATABASE', 'db')
    

    upload_ftp = '--upload_ftp' in sys.argv[1:]
    print(upload_ftp)

    mydb = mysql.connector.connect(host=host, user=user, password=password, database=database)
    cursor = mydb.cursor()

    time_start = time.time()
    print('events')
    result_categories = {
        '333': [500, 600],
        '222': [130, 170],
        '444': [2800],
        '555': [4500],
        '333oh': [1000, 1100],
        'pyram': [170, 200],
        'skewb': [200, 250],
        '333fm': [2300, 2500],
        'clock': [300, 350],
        'minx': [3200, 3500],
        'sq1': [700, 800]
    }
    result_categories_single = {
        '333bf': [2000, 2500]
    }
    categories_calc = {}
    for event in result_categories:
        for time_treshold in result_categories[event]:
            result = set()
            query = f'select person_id from ranks_average where event_id = "{event}" and best < {time_treshold}'
            title = f'result: {event} sub-{time_treshold/100}'
            cursor.execute(query)
            for id, in cursor:
                result.add(id)
            categories_calc[title] = result

    for event in result_categories_single:
        for time_treshold in result_categories_single[event]:
            result = set()
            query = f'select person_id from ranks_single where event_id = "{event}" and best < {time_treshold}'
            title = f'result: {event} sub-{time_treshold/100}'
            cursor.execute(query)
            for id, in cursor:
                result.add(id)
            categories_calc[title] = result
        
    print('worlds podium')
    # worlds podium
    worlds_query = 'select person_id from results where pos < 4 and best > 0 and round_type_id in ("c", "f") and competition_id in (select competition_id from championships where championship_type = "world")'
    cursor.execute(worlds_query)
    worlds_podiums = set()
    for person, in cursor:
        worlds_podiums.add(person)

    categories_calc['worlds_podium: '] = worlds_podiums

    # continental podium
    continents = ['_Europe', '_Asia', '_South America', '_North America', '_Africa', '_Oceania']
    def get_continental_query(continent):
        return f'''
                select competition_id, event_id, pos, person_id, person_country_id from results 
                where best > 0 
                and round_type_id in ("c", "f") 
                and competition_id in (select competition_id from championships where championship_type = "{continent}")
                and person_country_id in (select id from countries where continent_id = "{continent}")
                order by competition_id, event_id, pos
                '''

    print('continental podium')
    for continent_id in continents:
        print(continent_id)
        query = get_continental_query(continent_id)
        cursor.execute(query)
        podiums = defaultdict(list)
        last_pos = None
        for competition_id, event_id, pos, person_id, _ in cursor:
            if len(podiums[competition_id+event_id]) < 3:
                podiums[competition_id+event_id].append(person_id)
                if len(podiums[competition_id+event_id]) == 3:
                    last_pos = pos
                elif len(podiums[competition_id+event_id]) == 1:
                    last_pos = None # New event
            elif pos == last_pos:
                podiums[competition_id+event_id].append(person_id)
        result = set()
        for identifier in podiums:
            for person in podiums[identifier]:
                result.add(person)
            
        categories_calc[f'cont_podium: {continent_id}'] = result

    # comp counts
    print('comp counts')
    comps_query = '''select person_id, count(distinct competition_id) as comps FROM results
                    group by person_id
                    having comps > 99
                    order by comps desc'''

    cursor.execute(comps_query)
    comp_treshholds = [100, 150, 200]
    comp_results = [set(), set(), set()]
    for person_id, comps in cursor:
        for pos, treshold in enumerate(comp_treshholds):
            if comps >= treshold:
                comp_results[pos].add(person_id)

    for pos, treshold in enumerate(comp_treshholds):
        categories_calc[f'comps: {treshold}+'] = comp_results[pos]
    print(time.time() - time_start)
    print('dumping...')
    pickle.dump(categories_calc, open('data.pickle', 'wb'))

    if upload_ftp:
        import paramiko
        with paramiko.SSHClient() as ssh:
            ssh.load_system_host_keys()
            ssh_host = os.getenv('SFTP_HOST', '')
            ssh_port = int(os.getenv('SFTP_PORT', 22))
            ssh_user = os.getenv('SFTP_USER', '')
            ssh_pass = os.getenv('SFTP_PASS', '')
            ssh.connect(ssh_host, port=ssh_port, username=ssh_user, password=ssh_pass)
    
            sftp = ssh.open_sftp()

            ssh_file_path = os.getenv('SFTP_PATH', '')

            sftp.chdir(ssh_file_path)
            sftp.put('data.pickle', 'data.pickle')