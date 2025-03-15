import "reflect-metadata";
import { ColumnType } from "../enum";

/**
 * Table decorator to associate a class with a database table.
 */
export function Table(name: string) {
    return function (constructor: Function) {
        const tableName = name.toLowerCase();
        Reflect.defineMetadata("tableName", tableName, constructor);
        (constructor as any).tableName = tableName;
    };
}

/**
 * Column decorator to register class properties as database columns.
 */
export function Column(options?: {
    defaultValue?: any,
    enumValues?: string[],
    index?: boolean,
    onUpdate?: boolean,
    type?: ColumnType | string,
    unique?: boolean
}) {
    return function (target: any, propertyKey: string) {
        if (propertyKey === "id") return;

        if (!Reflect.hasMetadata("columns", target.constructor)) {
            Reflect.defineMetadata("columns", [], target.constructor);
        }

        const columns = Reflect.getMetadata("columns", target.constructor);
        columns.push({
            name: propertyKey,
            defaultValue: options?.defaultValue,
            enumValues: options?.enumValues,
            index: options?.index,
            onUpdate: options?.onUpdate,
            type: options?.type || ColumnType.STRING,
            unique: options?.unique
        });

        Reflect.defineMetadata("columns", columns, target.constructor);
    };
}

/**
 * Defines a One-to-Many relationship.
 */
export function OneToMany(target: () => Function, inverse: string) {
    return function (targetClass: any, propertyKey: string) {
        if (!Reflect.hasMetadata("relationships", targetClass.constructor)) {
            Reflect.defineMetadata("relationships", [], targetClass.constructor);
        }
        const relationships = Reflect.getMetadata("relationships", targetClass.constructor);
        relationships.push({ type: "OneToMany", propertyKey, target, inverse });
        Reflect.defineMetadata("relationships", relationships, targetClass.constructor);
    };
}

/**
 * Defines a Many-to-One relationship.
 */
export function ManyToOne(target: () => Function, inverse: string) {
    return function (targetClass: any, propertyKey: string) {
        if (!Reflect.hasMetadata("relationships", targetClass.constructor)) {
            Reflect.defineMetadata("relationships", [], targetClass.constructor);
        }
        const relationships = Reflect.getMetadata("relationships", targetClass.constructor);

        relationships.push({
            type: "ManyToOne",
            propertyKey,
            target,
            inverse
        });

        Reflect.defineMetadata("relationships", relationships, targetClass.constructor);
    };
}


/**
 * Defines a Many-to-Many relationship.
 */
export function ManyToMany(target: () => Function, joinTable: string) {
    return function (targetClass: any, propertyKey: string) {
        if (!Reflect.hasMetadata("relationships", targetClass.constructor)) {
            Reflect.defineMetadata("relationships", [], targetClass.constructor);
        }
        const relationships = Reflect.getMetadata("relationships", targetClass.constructor);
        relationships.push({ type: "ManyToMany", propertyKey, target, joinTable });
        Reflect.defineMetadata("relationships", relationships, targetClass.constructor);
    };
}
