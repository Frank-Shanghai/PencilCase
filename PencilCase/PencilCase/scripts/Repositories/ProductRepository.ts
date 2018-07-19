import { Application } from '../application';
import { Product } from '../Models/Product';

export interface FieldValuePair {
    Field: string;
    Type: string;//string, number, int
    Value: any;
}

export class ProductRepository {
    private db: Database;

    constructor() {
        this.db = Application.instance.openDataBase();
    }

    public getAll = (successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        this.db.transaction((transaction) => {
            transaction.executeSql('select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                        join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id \
                                        join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id', [], successCallback, errorCallback);
        });
    }

    public update = (product: Product, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        let sqlString = "update Product set Name = '" + product.Name + "', Description = '" + product.Description + "', RetailPrice = " + product.RetailPrice + ", RetailWholesalePrice = " + product.RetailWholesalePrice + ", RetailUnit = '" + product.RetailUnit + "', WholesalePrice = " +
            product.WholesalePrice + ", WholesaleUnit = '" + product.WholesaleUnit + "', ImportWholesalePrice = " + product.ImportWholesalePrice + ", ImportRetailPrice = " + product.ImportRetailPrice + ", WholesaleCost = " + product.WholesaleCost + ", RetailCost = " + product.RetailCost + ", Times = " + product.Times + ", Inventory = " + product.Inventory + ", Image = '" + product.Image + "', ModifiedDate = '" +
            moment((new Date(Date.now())).toISOString()).format("YYYY-MM-DD hh:mm:ss") + "' where Id = '" + product.Id + "'";

        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });
    }

    public updateWithFieldValuesSqlStatement = (keyValuePairs: Array<FieldValuePair>, productId: string): string => {
        if (keyValuePairs.length === 0) return null;
        let sqlString = "update Product set ";
        let fieldValues = '';
        for (let i = 0; i < keyValuePairs.length; i++) {
            switch (keyValuePairs[i].Type) {
                case "number":
                    fieldValues = ' ' + keyValuePairs[i].Field + " = " + keyValuePairs[i].Value + ",";
                    sqlString += fieldValues;
                    break;
                default:
                    fieldValues = ' ' + keyValuePairs[i].Field + " = '" + keyValuePairs[i].Value + "',";
                    sqlString += fieldValues;
                    break;
            }
        }

        sqlString += " ModifiedDate = '" + moment((new Date(Date.now())).toISOString()).format("YYYY-MM-DD") + "'";
        //http://www.w3school.com.cn/jsref/jsref_substring.asp, explains why the secondn parameter is sqlString.length - 1
        //sqlString = sqlString.substring(0, sqlString.length - 2);
        //sqlString = sqlString.substring(0, sqlString.length - 1);

        sqlString += " where Id = '" + productId + "'";

        return sqlString;
    }

    public updateWithFieldValues = (keyValuePairs: Array<FieldValuePair>, productId: string, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        if (keyValuePairs.length == 0) return;
        let sqlString = this.updateWithFieldValuesSqlStatement(keyValuePairs, productId);

        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });

    }

    public insert = (product: Product, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        let sqlString = "insert into Product values ('" + product.Id + "','" + product.Name + "','" + product.Description + "'," + product.RetailPrice + "," + product.RetailWholesalePrice + ",'" + product.RetailUnit + "'," +
            product.WholesalePrice + ",'" + product.WholesaleUnit + "'," + product.ImportWholesalePrice + "," + product.ImportRetailPrice + "," + product.WholesaleCost + "," + product.RetailCost + "," + product.Times + "," + product.Inventory + ",'" + product.Image + "','" +
            moment(product.CreatedDate.toISOString()).format("YYYY-MM-DD hh:mm:ss") + "','" + moment(product.ModifiedDate.toISOString()).format("YYYY-MM-DD hh:mm:ss") + "')";

        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });
    }

    public getProductById = (id: string, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        this.db.transaction((transaction) => {
            transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                where P.Id = '" + id + "'",
                [], successCallback, errorCallback);
        });
    }

    public getProductByRowId = (rowId: number, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        this.db.transaction((transaction) => {
            transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                where P.rowid = " + rowId,
                [], successCallback, errorCallback);
        });
    }

    public delete = (id: string, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        this.db.transaction((transaction: SqlTransaction) => {
            transaction.executeSql("delete from Product where Id = '" + id + "'", [], successCallback, errorCallback);
        });
    }
}