var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "u^NqtN@s74Yy",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    start();
});

function start() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        console.log(res);
        console.log("Shop at Bamazon!");
        prompt();
    });
};

function prompt() {
    inquirer.prompt([{
        type: "input",
        name: "itemID",
        message: "Which item would you like to buy?"
    },

    {
        type: "input",
        name: "units",
        message: "Quantity?"
    }

]).then(function (item) {
    var product = item.itemID;
    connection.query(
        "SELECT stock_quantity FROM products WHERE ?", {
            id: product
        },
        function (err, res) {
            if (err) throw err;
            var leftInStock = res[0].stock_quantity;
            if (item.units <= leftInStock) {
                console.log("Thank you for shopping at Bamazon!");
                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [{
                        stock_quantity: leftInStock - item.units
                    },
                    {
                        id: product
                    }
                
                ]
                )
                keepShopping();
            } else {
                console.log("That item is no longer available.")
                keepShopping();
            }
        }
    )
})
}

function keepShopping() {
    inquirer.prompt({
        type: "list",
        name: "keepShopping",
        message: "Continue shopping?",
        choices: ["Yes", "No"]
    }).then(function (item) {
        if (item.keepShopping === "Yes") {
            start();
        } else {
            connection.end();
        }
    })
};