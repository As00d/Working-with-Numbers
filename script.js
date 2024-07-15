'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// The first thing to note here is every number in javascript is basically a floating number, no matter how we write it. By floating number we mean is decimal no.

console.log(23 === 23.0);
// every number in js is stored with base 2 i.e in binary number 0-1 In binary format it is quite difficult to represent some decimal no.'s say 0.2 which is quite easy to represent in base 10 format (0-9)
// converting 0.2 in binary is difficult so we have this weird output -> 0.30000000000000004
console.log(0.1 + 0.2);

// In many other languages also we have similar way for eg php ruby so we should not use js for scientific calculations
console.log(0.1 + 0.2 === 0.3);

// Conversion
console.log('23');
console.log(Number('23'));
console.log(+'23');

// Parsing - parse Int tries to fetch the numeric value from the string and returns only if it starts with numeric value otherwise return NaN. This Number.parseInt also takes the 2nd argument which is called radix - base of the no.

console.log(Number.parseInt('45px', 10));
console.log(Number.parseInt('px56', 10));

console.log(Number.parseInt('   2.4em', 10));
console.log(Number.parseFloat('  .6em', 10));
// These parseFloat and parseInt is basically a global function so we can use it without using Number. But advised to use it with number only

console.log(parseInt('   2.4em', 10));

// Is NaN - Check only if a value is NaN
console.log(Number.isNaN(90));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20em'));
console.log(Number.isNaN(20 / 0));

// Is finite - BETTER way to check if a value is a number
console.log(Number.isFinite(90));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20em'));
console.log(Number.isFinite(20 / 0));

// If only integers are concerned we should use isInteger

console.log(Number.isInteger(90));
console.log(Number.isInteger('20'));
console.log(Number.isInteger(+'20em'));
console.log(Number.isInteger(20 / 0));

// Lecture Math and rounding

// squareRoot
console.log(Math.sqrt(36));
// using exponential to get square root
console.log(36 ** 0.5);
// cube root
console.log(27 ** (1 / 3));

// Max and minimum value
// Max method do type coesrcion but does not do parsing, minimum also similar
console.log(Math.max(2, 3, 4, 56, 324, 123, 34));
console.log(Math.max(2, 3, 4, 56, 324, 123, '34'));
console.log(Math.max(2, 3, 4, 56, 324, 123, '34px'));

// We are not limited to these formula but also have constant namespace also
// calculate the raduis of a number
console.log(Math.PI * Number.parseFloat('10px') ** 2);

// Math.random - 1 to 6
const number1 = 20;
const number2 = 30;
//  0 - 30
// say i want number between 20 - 30

const randomNumber = (max, min) => {
  console.log(Math.trunc(Math.random() * (max - min) + 1) + min);
};
randomNumber(20, 30);

// Rounding numbers
console.log(Math.trunc(2.34345));
console.log(Math.round(323.324));
console.log(Math.floor(323.324));
console.log(Math.ceil(323.324));

// Rounding decimals
console.log((2.56).toFixed(3));
console.log((2.56).toFixed(1));
console.log((2.323).toFixed(2));
// The thing to note in here is that it returns a string instead of an integer

// Lecture - The remainder operator
console.log(5 % 2);
console.log(6 % 2);
// the remainder operator % and it gives the remainder, the divide method gives the quotient this gives remainder. This gives us a very old school question - to check if number is even or odd

const isEven = num => num % 2 === 0;

console.log(isEven(4));
console.log(isEven(5));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach((elem, index) => {
    if (index % 2 === 0) {
      elem.style.background = 'cyan';
    }
    if (index % 3 === 0) {
      elem.style.background = 'lightpink';
    }
  });
});
// every nth time - good to use remainder operator

// Lecture - Numeric separator
// Now what in world is this numeric separator ? So while working with numbers there might be a case where we need to represent a large no. say amount of money ambani has. But due to large no. of zeroes its become really difficult to read this no. so we can take advantage of numerical seperator that is _ , so we can easily read its equivalent to Rs765,348.00 crore which was difficult to read otherwise

const ambaniWorth = 765348_00_000;
console.log(ambaniWorth);

const balanceInBank = 234_56;
// means 234 ruppees and 56 paisa

// There are some limitations to where we can put this _ also
// 1. we can add this in between 2 number only , not like 3._14 , or not in the start nor at the end
// 2. Also when this data comes in string say 314_23 and we try to convert this string this gives NaN so we should only use where its become difficult to read about the number.
const PI = 3.1415;

// Lecture - Using and understanding BigInt
// Numbers are internally stored as 64 bits meaning 64 1 and 0 to store any number say for eg now
// 00000000010000100000010000001
// Out of these 64 bits only 53 is used to store a no. rest is to store position of decimal point and sign

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
// for eg
console.log(2 ** 53 + 7);
// so the above result is incorrect so if we try to do calculation with no. greater that this then we might lose precision. Also there might be different places where we might need to store a no. larger than this number maybe some id or getting from an api in that case how we would handle ? So we have bigInt

console.log(930498230948373432987137134739824739847n);
console.log(BigInt(930498230948));

// Operations for big integers
console.log(10000n + 10000n);
const numberBigInt = 10038423098403n;
console.log(numberBigInt);
console.log(8273920743904830294809324n * 38439247392n);

// Not possible to mix normal number and bigInt numbers
const huge = 937549328759n;
const num = 29;
console.log(huge * BigInt(num));

// Math operation also does not work like this
// IMP
// console.log(Math.sqrt(4n));

// script.js:400 Uncaught
// TypeError: Cannot mix BigInt and other types, use explicit conversions
//at script.js:400:17

// There are some exceptions also
// 1. logical operators - it works
console.log(20n > 21);
// 2. When concat with string
console.log(huge + ' Really big');

// Division
console.log(11n / 4n); // it cuts the decimal part

console.log(11 / 4);
