import { Application } from '../application';
import { Order } from '../Models/Order';

export class OrderRepository {
    private db: Database;

    constructor() {
        this.db = Application.instance.openDataBase();
    }

    public insertSqlStatement = (order: Order): string => {
        let sqlString = "insert into Orders values ('" + ko.unwrap(order.id) + "','" + ko.unwrap(order.batchId) + "','" + ko.unwrap(order.productId) + "'," + ko.unwrap(order.type) + ",'" + ko.unwrap(order.unitId) + "'," +
            ko.unwrap(order.price) + "," + ko.unwrap(order.quantity) + "," + ko.unwrap(order.total) + ",'" +
            moment(order.createdDate.toISOString()).format("YYYY-MM-DD") + "','" + moment(order.modifiedDate.toISOString()).format("YYYY-MM-DD") + "')";
        return sqlString;
    }

    public insert = (order: Order, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        let sqlString = this.insertSqlStatement(order);
        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });
    }
}