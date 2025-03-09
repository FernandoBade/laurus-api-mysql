import "reflect-metadata";

/**
 * Table decorator to associate a class with a database table.
 */
export function Table(name: string) {
    return function (constructor: Function) {
        const tableName = name.toLowerCase();
        Reflect.defineMetadata("tableName", name, constructor);
        (constructor as any).tableName = name;
    };
}

/**
 * Column decorator to register class properties as database columns.
 */
export function Column() {
    return function (target: any, propertyKey: string) {
        if (!target.constructor.columns) {
            target.constructor.columns = [];
        }
        target.constructor.columns.push(propertyKey);
    };
}
