from pymongo import MongoClient
import mtg_api # Import from file
from functools import reduce
import requests
import datetime
import json

# Paste your api key into a text file called 'eminence_api_key.txt'
with open("./eminence_api_key.txt", 'r') as f:
    apiKey = f.readline().replace('\n', '')

def fetch_tournaments():
    data = {'last': 365, # TODO: CHANGE THIS TO A REASONABLE NUMBER WHEN ATTACHING TO CRON JOB
        'columns': ['name',
        'profile',
        'decklist',
        'wins',
        'winsSwiss',
        'winsBracket',
        'winRate',
        'winRateSwiss',
        'winRateBracket',
        'draws',
        'losses',
        'lossesSwiss',
        'lossesBracket']}
    
    headers = {'Content-Type': 'application/json',
        'Authorization': apiKey,
        'Accept': 'application/json'}

    r = requests.post("https://eminence.events/api", json=data, headers=headers)
    return json.loads(r.text)

if __name__ == '__main__':

    client = MongoClient("mongodb://localhost:27017")

    db = client['cedhtop16']

    existing_tourneys = []

    # Get existing tournament names
    for i in db['metadata'].find():
        try:
            existing_tourneys.append(i['TID'])
        except KeyError:
            continue

    tournaments = fetch_tournaments()
    
    for tourney in tournaments:
        # Is this check needed??
        if tourney['TID'] not in existing_tourneys:
            for i, j in enumerate(tourney['standings']):
                j.update({'standing': i+1})
            standings = [i for i in tourney['standings'] if i['decklist']]
            if standings:
                db['metadata'].insert_one({
                    'TID': tourney['TID'],
                    'tournamentName': tourney['tournamentName'] if tourney['tournamentName'] else 'Unnamed Tournament',
                    'size': len(tourney['standings']),
                    'date': datetime.datetime.fromtimestamp(tourney['dateCreated']),
                    'dateCreated': tourney['dateCreated']
                })
                db[tourney['TID']].insert_many(standings)