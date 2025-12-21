"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionType = exports.TransactionSource = exports.Theme = exports.TableName = exports.SortOrder = exports.Profile = exports.Operator = exports.LogOperation = exports.LogType = exports.LogCategory = exports.Language = exports.HTTPStatus = exports.DateFormat = exports.Currency = exports.ColumnType = exports.CategoryColor = exports.CategoryType = exports.CreditCardFlag = exports.AccountType = void 0;
var AccountType;
(function (AccountType) {
    AccountType["CHECKING"] = "checking";
    AccountType["PAYROLL"] = "payroll";
    AccountType["SAVINGS"] = "savings";
    AccountType["INVESTMENT"] = "investment";
    AccountType["LOAN"] = "loan";
    AccountType["OTHER"] = "other";
})(AccountType || (exports.AccountType = AccountType = {}));
var CreditCardFlag;
(function (CreditCardFlag) {
    CreditCardFlag["VISA"] = "visa";
    CreditCardFlag["MASTERCARD"] = "mastercard";
    CreditCardFlag["AMEX"] = "amex";
    CreditCardFlag["ELO"] = "elo";
    CreditCardFlag["HIPERCARD"] = "hipercard";
    CreditCardFlag["DISCOVER"] = "discover";
    CreditCardFlag["DINERS"] = "diners";
})(CreditCardFlag || (exports.CreditCardFlag = CreditCardFlag = {}));
var CategoryType;
(function (CategoryType) {
    CategoryType["INCOME"] = "income";
    CategoryType["EXPENSE"] = "expense";
})(CategoryType || (exports.CategoryType = CategoryType = {}));
var CategoryColor;
(function (CategoryColor) {
    CategoryColor["RED"] = "red";
    CategoryColor["BLUE"] = "blue";
    CategoryColor["GREEN"] = "green";
    CategoryColor["PURPLE"] = "purple";
    CategoryColor["YELLOW"] = "yellow";
    CategoryColor["ORANGE"] = "orange";
    CategoryColor["PINK"] = "pink";
    CategoryColor["GRAY"] = "gray";
    CategoryColor["CYAN"] = "cyan";
    CategoryColor["INDIGO"] = "indigo";
})(CategoryColor || (exports.CategoryColor = CategoryColor = {}));
var ColumnType;
(function (ColumnType) {
    ColumnType["VARCHAR"] = "VARCHAR(255)";
    ColumnType["CHAR"] = "CHAR(255)";
    ColumnType["TEXT"] = "TEXT";
    ColumnType["TINYINT"] = "TINYINT";
    ColumnType["INTEGER"] = "INT";
    ColumnType["MEDIUMINT"] = "MEDIUMINT";
    ColumnType["BIGINT"] = "BIGINT";
    ColumnType["FLOAT"] = "FLOAT";
    ColumnType["DOUBLE"] = "DOUBLE";
    ColumnType["DECIMAL"] = "DECIMAL(10,2)";
    ColumnType["BOOLEAN"] = "BOOLEAN";
    ColumnType["DATE"] = "DATE";
    ColumnType["DATETIME"] = "DATETIME";
    ColumnType["TIME"] = "TIME";
    ColumnType["TIMESTAMP"] = "TIMESTAMP";
    ColumnType["CURRENT_TIMESTAMP"] = "CURRENT_TIMESTAMP";
    ColumnType["YEAR"] = "YEAR";
    ColumnType["ENUM"] = "ENUM";
    ColumnType["BLOB"] = "BLOB";
})(ColumnType || (exports.ColumnType = ColumnType = {}));
var Currency;
(function (Currency) {
    Currency["ARS"] = "ARS";
    Currency["COP"] = "COP";
    Currency["BRL"] = "BRL";
    Currency["EUR"] = "EUR";
    Currency["USD"] = "USD";
})(Currency || (exports.Currency = Currency = {}));
var DateFormat;
(function (DateFormat) {
    DateFormat["DD_MM_YYYY"] = "DD/MM/YYYY";
    DateFormat["MM_DD_YYYY"] = "MM/DD/YYYY";
})(DateFormat || (exports.DateFormat = DateFormat = {}));
var HTTPStatus;
(function (HTTPStatus) {
    HTTPStatus[HTTPStatus["OK"] = 200] = "OK";
    HTTPStatus[HTTPStatus["CREATED"] = 201] = "CREATED";
    HTTPStatus[HTTPStatus["MOVED_PERMANENTLY"] = 301] = "MOVED_PERMANENTLY";
    HTTPStatus[HTTPStatus["NOT_MODIFIED"] = 304] = "NOT_MODIFIED";
    HTTPStatus[HTTPStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HTTPStatus[HTTPStatus["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HTTPStatus[HTTPStatus["FORBIDDEN"] = 403] = "FORBIDDEN";
    HTTPStatus[HTTPStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HTTPStatus[HTTPStatus["CONFLICT"] = 409] = "CONFLICT";
    HTTPStatus[HTTPStatus["PRECONDITION_FAILED"] = 412] = "PRECONDITION_FAILED";
    HTTPStatus[HTTPStatus["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    HTTPStatus[HTTPStatus["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    HTTPStatus[HTTPStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    HTTPStatus[HTTPStatus["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    HTTPStatus[HTTPStatus["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    HTTPStatus[HTTPStatus["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
})(HTTPStatus || (exports.HTTPStatus = HTTPStatus = {}));
var Language;
(function (Language) {
    Language["EN_US"] = "en-US";
    Language["ES_ES"] = "es-ES";
    Language["PT_BR"] = "pt-BR";
})(Language || (exports.Language = Language = {}));
var LogCategory;
(function (LogCategory) {
    LogCategory["ACCOUNT"] = "account";
    LogCategory["AUTH"] = "auth";
    LogCategory["CATEGORY"] = "category";
    LogCategory["DATABASE"] = "database";
    LogCategory["TRANSACTION"] = "transaction";
    LogCategory["LOG"] = "log";
    LogCategory["MIGRATION"] = "migration";
    LogCategory["MIGRATION_GROUP"] = "migrationGroup";
    LogCategory["SERVER"] = "server";
    LogCategory["SUBCATEGORY"] = "subcategory";
    LogCategory["USER"] = "user";
    LogCategory["CREDIT_CARD"] = "creditCard";
})(LogCategory || (exports.LogCategory = LogCategory = {}));
var LogType;
(function (LogType) {
    LogType["ALERT"] = "alert";
    LogType["DEBUG"] = "debug";
    LogType["ERROR"] = "error";
    LogType["SUCCESS"] = "success";
})(LogType || (exports.LogType = LogType = {}));
var LogOperation;
(function (LogOperation) {
    LogOperation["APPLY"] = "apply";
    LogOperation["CREATE"] = "create";
    LogOperation["DELETE"] = "delete";
    LogOperation["LOGIN"] = "login";
    LogOperation["LOGOUT"] = "logout";
    LogOperation["UPDATE"] = "update";
    LogOperation["ROLLBACK"] = "rollback";
    LogOperation["SEARCH"] = "search";
    LogOperation["STATUS"] = "status";
    LogOperation["AUTH"] = "auth";
})(LogOperation || (exports.LogOperation = LogOperation = {}));
var Operator;
(function (Operator) {
    Operator["EQUAL"] = "=";
    Operator["IN"] = "IN";
    Operator["LIKE"] = "LIKE";
    Operator["BETWEEN"] = "BETWEEN";
    Operator["ASC"] = "ASC";
    Operator["DESC"] = "DESC";
    Operator["DATE"] = "DATE";
})(Operator || (exports.Operator = Operator = {}));
var Profile;
(function (Profile) {
    Profile["STARTER"] = "starter";
    Profile["PRO"] = "pro";
    Profile["MASTER"] = "master";
})(Profile || (exports.Profile = Profile = {}));
var SortOrder;
(function (SortOrder) {
    SortOrder["ASC"] = "asc";
    SortOrder["DESC"] = "desc";
})(SortOrder || (exports.SortOrder = SortOrder = {}));
var TableName;
(function (TableName) {
    TableName["ACCOUNT"] = "account";
    TableName["LOG"] = "log";
    TableName["MIGRATION"] = "migration";
    TableName["MIGRATION_GROUP"] = "migration_group";
    TableName["REFRESH_TOKEN"] = "refresh_token";
    TableName["USER"] = "user";
    TableName["CATEGORY"] = "category";
    TableName["SUBCATEGORY"] = "subcategory";
    TableName["TRANSACTION"] = "transaction";
    TableName["CREDIT_CARD"] = "credit_card";
})(TableName || (exports.TableName = TableName = {}));
var Theme;
(function (Theme) {
    Theme["DARK"] = "dark";
    Theme["LIGHT"] = "light";
})(Theme || (exports.Theme = Theme = {}));
var TransactionSource;
(function (TransactionSource) {
    TransactionSource["ACCOUNT"] = "account";
    TransactionSource["CREDIT_CARD"] = "creditCard";
})(TransactionSource || (exports.TransactionSource = TransactionSource = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["INCOME"] = "income";
    TransactionType["EXPENSE"] = "expense";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
