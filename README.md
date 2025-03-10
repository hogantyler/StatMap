# StatMap
A web game that provides random facts to players and they are tasked with guessing where the fact is from (either country or city)

## Group Members
Project Manager/Product Manager - Tyler Hogan
UI/UX - Jun Hong
QA/Architect - Dane Breaker
Technical Writer - Fernando Garza
Data guy - Maciej Koziol
Backend - Dong Woo Lee

# RULES AND INSTRUCTIONS

## RUNNING THE WEBSITE LOCALLY 
Locate the StatMap folder (run ‘git clone https://github.com/hogantyler/StatMap/tree/dev’ in the VS Code terminal/powershell command line if uninstalled)
Run git checkout dev
Run git pull
Run npm install
Run npm start
Open “http://localhost:3000/” in a tab

## WORKING ON THE PROJECT
- Locate the StatMap folder in your preferred IDE
- Run git branch and make sure you are on the dev branch
- Run git pull
- Get to work!
- Run git push when work completed

## QUIZ MODE
- To play, press the “QUIZ” button on the landing page
- Player is given a total of 10 facts
- Player must read the fact presented and give their best guess on what country that fact pertains to
- Refer to scoring

## UNLIMITED MODE
- To play, press the “UNLIMITED” button on the landing page
- Player is given as many facts as are in the database
- Player must read the fact presented and give their best guess on what country that fact pertains to
- Refer to scoring

## SCORING
- For each question, the user scores a number out of a possible 1000 points
- For getting the question correct on the first try, 1000 points is awarded
- Getting the question correct after a certain number of hints awards the following points:
  - 1 hint (continent): 750
  - 2 hints (capital city): 500
  - 3 hints (abbreviation): 250
- If the player still does not respond with the correct country, they are awarded 0 points for that question
