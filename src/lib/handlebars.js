const timeago = require('timeago.js');
const timeagoInstance = timeago();

const helpers = {};

helpers.trimString = (passedString) => {
  var theString = passedString.substring(0, 100);
  return '' + theString + '...';
};

helpers.trimStringMin = (passedString) => {
  var theString = passedString.substring(0, 10);
  return '' + theString + '...';
};

helpers.trimProperty = (passedString) => {
  var theString = passedString.split(',');
  return '' + theString[0];
};

helpers.timeago = (savedTimestamp) => {
  return timeagoInstance.format(savedTimestamp);
};

helpers.ifcond = (a, b, opts) => {
  if (a == b) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
};

helpers.iff = (a, operator, b, opts, prod) => { 
  var bool = false;
  switch (operator) {
    case '==':
      bool = a == b;
      break;
    case '>':
      bool = a > b;
      break;
    case '<':
      bool = a < b;
      break;
    default:
      throw 'Unknown operator ' + operator;
  }

  if (bool) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
};

helpers.forch = (arr, pid, opts) => {
  var bool = false;
  var pidsfc = Array.from(arr);

  pidsfc.forEach((item, i) => {
    if (item == pid) {
      bool = true;
    }
  });

  if (bool) {
    return opts.fn(this);
  } else {
    return opts.inverse(this);
  }
};

helpers.createStringList = (array) => {
  console.log(array);
  var result = '';
  for (var i = 0; i < array.length; i++) {
    result += '<li>' + array[i] + '</li>';
  }
  return new hbs.SafeString('<ul>' + result + '</ul>');
};

helpers.pagination = (currentPage, totalPage, size, options) => {
  var startPage, endPage, context;

  if (arguments.length === 3) {
    options = size;
    size = 5;
  }

  startPage = currentPage - Math.floor(size / 2);
  endPage = currentPage + Math.floor(size / 2);

  if (startPage <= 0) {
    endPage -= (startPage - 1);
    startPage = 1;
  }

  if (endPage > totalPage) {
    endPage = totalPage;
    if (endPage - size + 1 > 0) {
      startPage = endPage - size + 1;
    } else {
      startPage = 1;
    }
  }

  context = {
    startFromFirstPage: false,
    pages: [],
    endAtLastPage: false,
  };
  if (startPage === 1) {
    context.startFromFirstPage = true;
  }
  for (var i = startPage; i <= endPage; i++) {
    context.pages.push({
      page: i,
      isCurrent: i === currentPage,
    });
  }
  if (endPage === totalPage) {
    context.endAtLastPage = true;
  }

  return options.fn(context);
};

module.exports = helpers;
