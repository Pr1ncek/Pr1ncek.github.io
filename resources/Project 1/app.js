// BUDGET CONTROLLER
var budgetController = (function() {
  // CREATE THE EXPENSE OBJECT USING A FUNCTION CONSTRUCTOR
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  //MAKE SURE TO ALWAYS PASS IN ANY VARIABLES THAT A FUNCTION NEEDS AS AN ARGUMENT. THIS MAKES THE FUNCTIONS MORE INDEPENDENT.
  Expense.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0)
      this.percentage = Math.round(this.value / totalIncome * 100);
  };

  Expense.prototype.getExpPercentage = function() {
    return this.percentage;
  };

  // CREATE THE INCOME OBJECT USING A FUNCTION CONSTRUCTOR
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  // THIS OBJECT IS USED TO STORE ALL THE INFORMATION ABOUT THE BUDGET
  // INSTEAD TO ADDING A LOT OF VARIABLES IN THE FUNCTION, WE SIMPLY CREATE AN OBJECT WHICH CONTAINS ALL THE VARIABLES WE NEED
  var data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    pecentage: -1
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });

    data.totals[type] = sum;
  };

  return {
    addItem: function(type, des, value) {
      var id, newItem;

      id =
        data.allItems[type].length == 0
          ? 0
          : data.allItems[type][data.allItems[type].length - 1].id + 1;

      if (type === "inc") {
        newItem = new Income(id, des, value);
      }

      if (type === "exp") {
        newItem = new Expense(id, des, value);
      }

      data.allItems[type].push(newItem);

      // RETURNING THE NEW INC/EXP ITEM SO THE MAIN CONTROLLER CAN THEN PASS THIS OBJECT TO THE UI CONTROLLER WHICH CAN DISPLAY OUR OBJECT ON THE SCREEN
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      //IN ORDER TO DELETE THE ITEM, WE FIRST HAVE TO FIND ITS INDEX IN INC/EXP ARRAY

      //THIS WILL RETURN A NEW ARRAY WITH JUST THE IDS OF ALL THE ELEMENTS
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      //FINDS THE INDEX OF THE ITEM OR -1 IF ITEM DOES NOT EXIST
      index = ids.indexOf(id);

      if (index !== -1) {
        //REMOVES ONE ELEMENT STARTING AT THE SPECIFIED INDEX
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // CALCULATE TOTAL INCOME AND EXPENSES
      calculateTotal("inc");
      calculateTotal("exp");

      // CALCULATE THE BUDGET: INCOME - EXPENSES
      data.budget = data.totals.inc - data.totals.exp;

      // CALCULATE THE PERCENTAGE OF INCOME THAT WE SPENT
      if (data.totals.inc > 0)
        data.pecentage = Math.round(data.totals.exp / data.totals.inc * 100);
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(current) {
        current.calculatePercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(current) {
        return current.getExpPercentage();
      });

      return allPercentages;
    },

    getBudget: function() {
      return {
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.pecentage,
        budget: data.budget
      };
    },
    testing: function() {
      console.log(data);
    }
  };
})();

//UI CONTROLLER
var UIController = (function() {
  // COLLECTING ALL OF OUR INPUT FIELD CLASS NAMES IN ONE PLACE, THESE ARE THE ELEMENTS WE WILL BE MUTATING
  var DOMInputs = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expPercentageLabel: ".item__percentage"
  };

  return {
    // THIS FUNCTION ACTUALLY SELECTS THE INPUT ELEMENTS AND RETURNS AN ANONYMOUS OBJECT WHICH CONTAINS THE VALUES OF THOSE INPUT ELEMENTS
    getInput: function() {
      return {
        type: document.querySelector(DOMInputs.inputType).value,
        description: document.querySelector(DOMInputs.inputDescription).value,

        //TO CHANGE THE VALUE WE COLLECT FROM A STRING TO A FLOAT, SO WE CAN DO SOME CALCULATIONS ON IT
        value: parseFloat(document.querySelector(DOMInputs.inputValue).value)
      };
    },

    // THIS METHOD ADDS OUR INC/EXP ITEM ONTO THE UI
    addListItem: function(obj, type) {
      var html, newHTML, element;

      //  CREATE HTML STRING WITH PLACEHOLDER TEXT
      if (type === "inc") {
        element = DOMInputs.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }
      if (type === "exp") {
        element = DOMInputs.expenseContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div id="item__percentage" class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //   REPLACE PLACEHOLDER TEXT WITH ACTUAL DATA FROM THE OBJECT ARGUMENT
      newHTML = html.replace("%id%", obj.id);
      newHTML = newHTML.replace("%description%", obj.description);
      newHTML = newHTML.replace("%value%", obj.value);

      //  INSERT THE NEW HTML INTO THE DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
    },

    deleteListItem: function(itemID) {
      var elementToDelete;

      elementToDelete = document.getElementById(itemID);

      elementToDelete.parentElement.removeChild(elementToDelete);
    },

    clearFields: function() {
      var fields, fieldsArr;

      // USED TO SELECT MULTIPLE ELEMENTS TOGETHER USING CSS SYNTAX
      fields = document.querySelectorAll(
        DOMInputs.inputDescription + ", " + DOMInputs.inputValue
      );

      // CONVERT THE FIELDSARR LIST INTO AN ARRAY USING SLICE
      fieldsArr = Array.prototype.slice.call(fields);

      // EASY WAY TO CLEAR THE SELECTED FIELDS IN THE FIELDS ARRAY
      fieldsArr.forEach(function(current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    getDOMInputs: function() {
      return DOMInputs;
    },

    displayBudget: function(budgetObject) {
      document.querySelector(DOMInputs.budgetLabel).textContent =
        budgetObject.budget;
      document.querySelector(DOMInputs.incomeLabel).textContent =
        budgetObject.totalInc;
      document.querySelector(DOMInputs.expenseLabel).textContent =
        budgetObject.totalExp;

      if (budgetObject.percentage > 0)
        document.querySelector(DOMInputs.percentageLabel).textContent =
          budgetObject.percentage + "%";
      else
        document.querySelector(DOMInputs.percentageLabel).textContent = "---";
    },

    displayPercentages: function(percentages) {
      var fields;

      fields = document.querySelectorAll(DOMInputs.expPercentageLabel);

      var nodeListForEach = function(nodeList, callBackFunc) {
        for (var i = 0; i < nodeList.length; i++) callBackFunc(nodeList[i], i);
      };

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0)
          current.textContent = percentages[index] + "%";
        else current.textContent = "---";
      });
    }
  };
})();

// GLOBAL APP CONTROlLER
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListeners = function() {
    var DOM;

    DOM = UICtrl.getDOMInputs();

    document
      .querySelector(DOM.inputButton)
      .addEventListener("click", ctrlAddItem);

    // ADDS A KEY PRESS EVENT LISTENER TO THE ENTIRE DOCUMENT
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      }
    });

    // ADDING AN EVENT LISTENER TO THE PARENT OF THE INC AND EXP ELEMENTS
    // THIS ALLOWS US TO DO EVENT DELEGATION
    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function() {
    var budget;

    //Calculate the budget
    budgetCtrl.calculateBudget();

    //Return the budget
    budget = budgetCtrl.getBudget();

    //Display budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    var percentages;
    // Calculate Percentages

    budgetCtrl.calculatePercentages();

    // Read percentages from budget controller
    percentages = budgetCtrl.getPercentages();
    // Update UI with new percentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;

    // To Do:

    // 1. Get the input fields from the elements
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add them to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      //3. Add them to the ui
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();

      //4. Calculate and update budget
      updateBudget();
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, id;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      id = parseInt(splitID[1]);

      // 1.   DELETE THE ITEM FROM THE BUDGET DATA STRUCTURE
      budgetCtrl.deleteItem(type, id);
      // 2.   DELETE THE ITEM FROM THE UI
      UICtrl.deleteListItem(itemID);

      // 3.   UPDATE AND SHOW THE NEW BUDGET
      updateBudget();
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Application Started");
      setupEventListeners();
      UICtrl.displayBudget({
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
        budget: 0
      });
    }
  };
})(budgetController, UIController);

controller.init();
