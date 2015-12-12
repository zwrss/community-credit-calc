var Credit = function(amount, interest) { 

  this.amount = amount; // double
  this.interest = interest; // double
  
  console.log('Credit initialized ' + this.amount + '; ' + this.interest);
  
  this.monthlyInterest = function() {
	  return this.interest / 12.0;
  }
  
  this.normalize = function(d) {
	  return Math.ceil(d * 100.0) / 100.0;
  }

  this.calculateOneTime = function(months) {
    var rate = this.amount;
    for(i = 0; i < months; i++) {
      rate = rate * (1.0 + this.monthlyInterest());
    }
    return this.normalize(rate);
  }

  this.calculateForRate = function(rate) {
    if (rate > amount * this.monthlyInterest()) {
      var tmpAmount = amount;
      var rates = [];
      while (tmpAmount > 0) {
        tmpAmount = tmpAmount * (1 + this.monthlyInterest());
        var rateWannabe = Math.min(rate, tmpAmount);
        rates.push(rateWannabe);
        tmpAmount = tmpAmount - rateWannabe;
      }
      return rates.map(this.normalize);
    } else {
      return [];
    }
  }

  this.calculateMonthly = function(months) {
    var _this = this;
    var check = function(inRate, delta) {
      if (delta < 0.01) return inRate;
      else {
        var c = _this.calculateForRate(inRate - delta);
        if (c.length == 0 || c.length > months) return check(inRate, delta / 2.0);
        else return check(inRate - delta, delta);
      }
    }

    var rate = check(amount, amount);
    return this.calculateForRate(rate);
  }
}

function getAmount() {
  return parseFloat(document.getElementById("credit-value").value);
}

function getInterest() {
  return parseFloat(document.getElementById("credit-interest").value) / 100;
}

function getMonths() {
  return parseFloat(document.getElementById("credit-months").value);
}

function getRate() {
  return parseFloat(document.getElementById("credit-rate").value);
}

function getInvestment() {
  return document.getElementById("credit-investment").checked;
}

function print(x) {
  document.getElementById("credit-table").innerHTML += x;
}

function printNode(x) {
  document.getElementById("credit-table").appendChild(x);
}

function clean() {
  document.getElementById("credit-table").innerHTML = "";
}

function normalize(d, x) {
  if (x == null) x = 2;
  var p = Math.pow(10, x);
  return Math.round(d * p) / p;
}

function calcInvestment(value, repay, months) {
  return normalize((Math.pow(repay / value, 1 / months) - 1) * 1200, 2);
}

function calcRevenue(value, repay) {
  return normalize((repay / value - 1) * 100, 2);
}

function creditOneTime() {
  var c = new Credit(getAmount(), getInterest());
  var rate = c.calculateOneTime(getMonths());
  var p = document.createElement("SPAN");
  var x = document.createElement("P");
  x.appendChild(document.createTextNode("One time rate for credit: " + rate));
  p.appendChild(x)
  x = document.createElement("P");
  x.appendChild(document.createTextNode("Investment revenue: " + calcRevenue(getAmount(), rate) + "% (" + calcInvestment(getAmount(), rate, getMonths()) + "%)"));
  p.appendChild(x);
  printNode(p);
}

function creditMontly() {
  var c = new Credit(getAmount(), getInterest());
  var rate = c.calculateMonthly(getMonths());
  var p = document.createElement("SPAN");
  var counter = 0;
  var ratesMinimized = [];
  rate.forEach(function (r) {
    if (counter != 0) {
      var index = ratesMinimized.length-1
      var tuple = ratesMinimized[index]
      if(tuple[1] == r) {
        ratesMinimized.pop();
      } else {
        counter = 0;
      }
    }
    counter = counter + 1;
    ratesMinimized.push([counter, r]);
    prevVal = r;
  });
  ratesMinimized.forEach(function (r) {
    var x = document.createElement("P");
    x.appendChild(document.createTextNode(r[0] + " times " + r[1]));
    p.appendChild(x);
  });
  var sum = normalize(rate.reduce(function(pv, cv) { return pv + cv; }, 0));
  var x = document.createElement("P");
  x.appendChild(document.createTextNode("Sum of: " + sum));
  p.appendChild(x);
  x = document.createElement("P");
  x.appendChild(document.createTextNode("Investment revenue: " + calcRevenue(getAmount(), sum) + "% (" + calcInvestment(getAmount(), sum, getMonths()) + "%)"));
  p.appendChild(x);
  printNode(p);
}

function creditFixedRate() {
  var c = new Credit(getAmount(), getInterest());
  var rate = c.calculateForRate(getRate());
  var p = document.createElement("SPAN");
  var counter = 0;
  var ratesMinimized = [];
  rate.forEach(function (r) {
    if (counter != 0) {
      var index = ratesMinimized.length-1
      var tuple = ratesMinimized[index]
      if(tuple[1] == r) {
        ratesMinimized.pop();
      } else {
        counter = 0;
      }
    }
    counter = counter + 1;
    ratesMinimized.push([counter, r]);
    prevVal = r;
  });
  ratesMinimized.forEach(function (r) {
    var x = document.createElement("P");
    x.appendChild(document.createTextNode(r[0] + " times " + r[1]));
    p.appendChild(x);
  });
  var sum = Math.floor(rate.reduce(function(pv, cv) { return pv + cv; }, 0) * 100.0) / 100.0;
  var x = document.createElement("P");
  x.appendChild(document.createTextNode("Sum of: " + sum));
  p.appendChild(x);
  x = document.createElement("P");
  x.appendChild(document.createTextNode("Investment revenue: " + calcRevenue(getAmount(), sum) + "% (" + calcInvestment(getAmount(), sum, rate.length) + "%)"));
  p.appendChild(x);
  printNode(p);
}

document.getElementById("credit-onetime").onclick = creditOneTime;
document.getElementById("credit-monthly").onclick = creditMontly;
document.getElementById("credit-fixed-rate").onclick = creditFixedRate;
document.getElementById("credit-clean").onclick = clean;