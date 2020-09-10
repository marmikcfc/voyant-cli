const {Command, flags} = require('@oclif/command');
const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');
const clear = require('clear');
const axios = require('axios');
const shell = require('shelljs');
const {getInstalledPath} = require('get-installed-path');
const fs = require('fs');



/*
  When I do Init, first login,
  next create a template main.py,
  next create a strategy,
  next do a git init and add git remote,

*/


class InitCommand extends Command {
   run() {


   clear();
    	
 console.log(
  chalk.yellow(
    figlet.textSync('Voyant', { horizontalLayout: 'full' })
  ));


 let login_information = [
 {
    type: 'input',
    name: 'email',
    message: "Looks like you haven't signed in yet. So, what's your registered email-id? \n"
  },

  {
    type: 'password',
    name: 'password',
    message: "What about the password? \n"
  },
  {
    type: 'input',
    name: 'name',
    message: "Name of the Strategy? \n"
  }
 ]

var req = {}


getInstalledPath('voyant-cli').then((path) => {
            console.log(path)
            shell.cp(path+"/bin/main.py", './');

            shell.exec("git init");
            

            shell.mkdir("/tmp/voyant/")

            

            console.log(chalk.yellow("Initialized Successfully!"));

          });

   
    


/*
 inquirer.prompt(login_information).then(answer => {

    axios.post("https://api.voyantapp.io/voyant/api/authenticate/login", {
            email: answer.email,
            password: answer.password
        }).then(resp => {

          if (resp.data.auth ==  false) {
            console.log(chalk.red("Wrong Login information"));
          }
          else{

            req["username"]= answer.email.split("@")[0];



            inquirer.prompt(questions).then(ans => {

                req["name"] = ans["name"];
                req["particularStocks"] = ans["particularStocks"];
                req["basket"]= ans["basket"];
                req["intraDay"] = ans["intraDay"];

                console.log(JSON.stringify(req));

            });
            
          }
          


        }).catch( err => {
          console.log(err);
        });

  	
  });

*/



  //console.log(chalk.yellow( 'Next steps : Include a dockerfile to be deployed on our k8s. \n when you are ready to deploy, simply fire voyant-cli deploy'));



  }
}

InitCommand.description = `Describe the command here
...
Extra documentation goes here
`

InitCommand.flags = {
  name: flags.string({char: 'n', description: 'name to print'}),
}

module.exports = InitCommand