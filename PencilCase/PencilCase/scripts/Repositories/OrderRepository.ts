import { Application } from '../application';
import { Order } from '../Models/Order';
import { OrderTypes } from '../Models/Order';

export class OrderRepository {
    private db: Database;

    constructor() {
        this.db = Application.instance.openDataBase();
    }

    public insertSqlStatement = (order: Order): string => {
        let sqlString = "insert into Orders values ('" + ko.unwrap(order.id) + "','" + ko.unwrap(order.batchId) + "','" + ko.unwrap(order.productId) + "'," + ko.unwrap(order.type) + ",'" + ko.unwrap(order.unitId) + "'," +
            ko.unwrap(order.price) + "," + ko.unwrap(order.quantity) + "," + ko.unwrap(order.total) + ",'" +
            moment(order.createdDate.toISOString()).format("YYYY-MM-DD hh:mm:ss") + "','" + moment(order.modifiedDate.toISOString()).format("YYYY-MM-DD hh:mm:ss") + "')";
        return sqlString;
    }

    public insert = (order: Order, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        let sqlString = this.insertSqlStatement(order);
        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });
    }

    public getBatchOrders = (successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        let sqlString = "select BatchId, Type, Sum(Quantity) as Quantity, Sum(Total) as Total, CreatedDate from Orders group by BatchId, Type, CreatedDate";

        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });
    }

    public getOrdersByBatchId = (batchId: string, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        let sqlString = "select * from Orders where BatchId = '" + batchId + "'";

        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });
    }

    public getOrdersForDataAnalyse(timeSpanString: string, groupByType?: boolean, type?: OrderTypes, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) {
        let conditions = " where ";
        conditions += timeSpanString;
        switch (type) {
            case OrderTypes.Retail:
                conditions += " and Type = 1";
                break;
            case OrderTypes.Wholesale:
                conditions += " and Type = 2";
                break;
        }

        let sqlString = '';
        if (groupByType == true) {
            sqlString = "select ProductId, Type, Sum(Quantity) as Quantity, Sum(Total) as Total from Orders" + conditions + " group by ProductId, Type";
        }
        else {
            conditions += " and Type != 3";// exculde import orders
            sqlString = "select ProductId, Sum(Quantity) as Quantity, Sum(Total) as Total from Orders" + conditions + " group by ProductId";
        }

        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });
    }

}