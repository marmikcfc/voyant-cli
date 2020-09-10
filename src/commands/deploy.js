const {Command, flags} = require('@oclif/command')
const fs = require('fs');
const chalk = require('chalk');
const shell = require('shelljs');
const inquirer = require('inquirer');
const axios = require('axios');
const home = require('ospath').home();
const {sign, verify} = require('jsonwebtoken');



/*
  Check if key exists
  If Key exists check it's validity
  If invalid ask for login information, if valid ask for other questions

  Q1: Is it a backtrader, pylivetrader or standalone strategy
  Q2: If it's a backtrader strategy type = backtrader
  Q3: If it's a pylivetrader strategy: Ask for quantopian tearsheet and/or Zipline backtest results
  Q4: If it's a other strategy - Papertrade or build a backtest component
  Q5: Strategy Name
  Q6: Strategy Description
  Q7: That's 

  TODO:
  Check if strategy exists
*/

const loginPrompt = () => {
      let login_information = [{
    type: 'input',
    name: 'username',
    message: "Looks like you haven't signed in yet. So, what's your username? \n"
  },

  {
    type: 'password',
    name: 'password',
    message: "What about the password? \n"

  }];

  inquirer.prompt(login_information).then( answer=> {
    console.log("INSIDE PROMPT")
    axios.post("http://localhost:3000/voyant/api/authenticate/login", {
            username: answer.username,
            password: answer.password
        }).then(resp => {
             if (resp.data.auth ==  false) {
            console.log(chalk.red("Wrong Login information"));
          }

          else{
            //let username = answer.email.split("@")[0];
            let cred = {};
            cred["token"] = resp.data.token;
            cred["username"] = answer.username;
            fs.writeFileSync(home+ '/.voyant/credentials.json', JSON.stringify(cred));
            makeStrategy();
          }

          }).catch(err =>{
          console.log(err);
        });
  });
}    


const postStrategy = (strategy,token) => {

axios.post("http://localhost:3000/voyant/api/strategy",strategy,{
                headers: {
                    "x-access-token": token
                }}).then(resp => {

                  console.log("Strategy Created");

                }).catch(err => {
                  console.log(err)
                });

}


const makeStrategy = () => {


  let strategyQuestions = [
  {
    type: 'input',
    name: 'strategyName',
    message: "What's the name of your awesome strategy? \n"
  },

  {
    type: 'input',
    name: 'strategyDescription',
    message: "Tell us how amazing your strategy is... \n"
  },

  {
    type: 'input',
    name: 'apis',
    message: "Give a coma seperated list of all the external APIs you've used. Ex: IEX (Press enter if you've used none)\n"
  },

  {
    type: 'list',
    name: 'type',
    message: 'What Type of Algorithm?',
    choices: ['Pylivetrader', 'Backtrader', 'None'],
    filter: function(val) {
      return val.toLowerCase();
    }
  },


  {
    type: 'list',
    name: 'isIntraday',
    message: 'Is it an Intraday Strategy?',
    choices: ['Yes', 'No'],
    filter: function(val) {
      return val.toLowerCase();
    }

  }];

  let path = home+ "/.voyant/";
  let jsonData = JSON.parse(fs.readFileSync(path+'credentials.json'));
  let strategy = {}
  strategy["username"] = jsonData["username"];
  let token = jsonData["token"];


  inquirer.prompt(strategyQuestions).then(answer => {

    strategy["name"] = answer["strategyName"];
    strategy["desc"] = answer["strategyDescription"];
    strategy["apis"] = answer["apis"].split(",");
    strategy["type"] = answer["type"];

    if(!fs.existsSync('./.git'))
    {
      shell.exec("git init");
    }
    
    

    shell.exec("git add .");
    shell.exec("git commit -m \" new commit\"");
    shell.exec("git remote add voyant http://localhost:7005/"+strategy["username"]+"/"+strategy["name"] +".git");
    shell.exec("git push voyant master");

    strategy["url"]= "http://localhost:7005/"+strategy["username"]+"/"+strategy["name"]+".git";
    strategy["isIntraday"] = answer["isIntraday"]
    
    postStrategy(strategy,token);
    
  });

}


class DeployCommand extends Command {
    


    
   run() {

let JWT_SECRET="X4oiXd5PxJWq69"
  let path = home+ "/.voyant/";

  console.log(fs.existsSync(path));
      if (!fs.existsSync(path)) {  
        console.log("FILE Does not EXISTIS OW")
        fs.mkdirSync(path);    
      }

      

      if (fs.existsSync(path+"credentials.json")){

        let jsonData = JSON.parse(fs.readFileSync(path+'credentials.json'));
        verify(jsonData["token"], JWT_SECRET, function(err, decoded) {
        if (err) {
          loginPrompt();
        }
        else{
          makeStrategy();
        }
    });


  }
  else{
    loginPrompt();
    
  }

    
  }
}

DeployCommand.description = `Describe the command here
...
Extra documentation goes here
`

DeployCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = DeployCommand

