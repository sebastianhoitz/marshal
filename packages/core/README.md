# Marshal

[![Build Status](https://travis-ci.com/marcj/marshal.svg?branch=master)](https://travis-ci.com/marcj/marshal)
[![npm version](https://badge.fury.io/js/%40marcj%2Fmarshal.svg)](https://badge.fury.io/js/%40marcj%2Fmarshal)
[![Coverage Status](https://coveralls.io/repos/github/marcj/marshal/badge.svg?branch=master)](https://coveralls.io/github/marcj/marshal?branch=master)

Marshal is a library to [marshal](https://en.wikipedia.org/wiki/Marshalling_(computer_science))
JSON-representable data from JSON to class instance to Mongo and vice versa.

If you have data models in your frontend, Node backend and MongoDB collections,
then Marshal helps you to convert between all those parties correctly.

![Diagram](https://raw.github.com/marcj/marshal/master/docs/assets/diagram.png)

## Install

```
npm install @marcj/marshal
```

## Example Entity

```typescript
import {
    ClassArray,
    ClassMap,
    DateType,
    Entity,
    ID,
    UUIDType,
    NumberType,
    EnumType,
    plainToClass,
    StringType,
    uuid,
    ArrayType,
} from '@marcj/marshal';


@Entity('sub')
class SubModel {
    @StringType()
    label: string;
}

export enum Plan {
    DEFAULT,
    PRO,
    ENTERPRISE,
}

@Entity('SimpleModel')
class SimpleModel {
    @ID()
    @UUIDType()
    id: string = uuid();

    @StringType()
    name: string;

    @StringType()
    @ArrayType()
    tags: string[];

    @NumberType()
    type: number = 0;

    @EnumType(Plan)
    plan: Plan = Plan.DEFAULT;

    @DateType()
    created: Date = new Date;

    @ClassArray(SubModel)
    children: SubModel[] = [];

    @ClassMap(SubModel)
    childrenMap: {[key: string]: SubModel} = {};

    constructor(name: string) {
        //constructor is supported and called as well
        this.name = name;
    }
}

const instance = plainToClass(SimpleModel, {
    name: 'myName',
    tags: ['foo', 'bar'],
    plan: 'PRO',
    created: 'Sat Oct 13 2018 14:17:35 GMT+0200',
    children: [{label: 'foo'}],
    childrenMap: {'foo': {label: 'foo'}},
});
console.log(instance);
/*
    SimpleModel {
      id: 'f2ee05ad-ca77-49ea-a571-8f0119e03038',
      name: 'myName',
      tags: ['foo', 'bar']
      type: 0,
      plan: 1,
      created: 2018-10-13T17:02:34.456Z,
      children: [ SubModel { label: 'foo' } ],
      childrenMap: { foo: SubModel { label: 'bar' } }
    }
*/
```

## Types

### ID

`@ID()` allows you to define the id of the entity. There can be only one
ID. Properties marked as ID on `_id` will receive its value after
inserting the instance in MongoDB using `Database.add()`. You need to
define either `@MongoIdType()` or `@UUIDType` together with `@ID()`.


### MongoIdType

`@MongoIdType()` stores an ObjectID. In TypeScript and JSON it's string, and in
MongoDB we store it automatically using Mongo's `ObjectID`.
You can have multiple properties using `@MongoIdType()`.

Data types:

| Plain  | Class  | Mongo  |
|:-------|:-------|:-------|
| string | string | ObjectID() |


### UUIDType

`@UUIDType()` stores a UUID. In TypeScript and JSON it's string, and in
MongoDB we store it automatically using Mongo's `UUID`.
You can have multiple properties using `@UUIDType()`.

Data types:

| Plain  | Class  | Mongo  |
|:-------|:-------|:-------|
| string | string | UUID() |

### StringType

`@StringType()` makes sure the property has always a string type.


Data types:

| JSON   | Class  | Mongo  |
|:-------|:-------|:-------|
| string | string | string |

### NumberType

`@NumberType()` makes sure the property has always a number type.


Data types:

| JSON   | Class  | Mongo  |
|:-------|:-------|:-------|
| number | number | number |

### DateType

`@DateType()` makes sure the property has always a date type. In JSON transport
(using classToPlain, or mongoToPlain) we use strings.

Data types:

| JSON    | Class | Mongo |
|:-------|:------|:------|
| string | Date  | Date  |


### EnumType

`@EnumType(enum)` makes sure the property has always a valid enum value. In JSON transport
(using classToPlain, or mongoToPlain) we use strings.

Data types:

| JSON   | Class | Mongo  |
|:-------|:------|:-------|
| String | Enum  | String |


### Class

`@Class(ClassDefinition)` makes sure you have in Javascript (plainToClass, or mongoToClass)
always an instance of `ClassDefinition`. In JSON and MongoDB it is stored as plain object.

Data types:

| JSON   | Class | Mongo  |
|:-------|:------|:-------|
| object | class | object |


### ClassArray

`@ClassArray(ClassDefinition)` makes sure you have in Javascript (plainToClass, or mongoToClass)
always an instance of `ClassDefinition[]`.
In JSON and MongoDB it is stored as plain array.

Data types:

| JSON  | Class | Mongo |
|:------|:------|:------|
| array | array | array |


### ClassMap

`@ClassMap(ClassDefinition)` makes sure you have in Javascript (plainToClass, or mongoToClass)
always an instance of `{[key: string]: ClassDefinition}`.
In JSON and MongoDB it is stored as plain object.

Data types:

| JSON   | Class  | Mongo  |
|:-------|:-------|:-------|
| object | object | object |


### Binary

`@Binary()` makes sure you have in Javascript (plainToClass, or mongoToClass)
always an instance of `Buffer` (npm Buffer package), in JSON a base64 string,
and mongo native Binary.

Data types:

| JSON   | Class  | Mongo  |
|:-------|:-------|:-------|
| string | Buffer | Binary |


## More Decorators

### ArrayType

`@ArrayType` is used to mark the property as array of defined type.
You should use together with `@ArrayType` one data type decorator from above.

```typescript
class Model {
    @StringType()
    @ArrayType()
    names: string[]; 
}
```

### MapType

`@MapType` is used to mark the property as object / map of defined type.
You should use together with `@MapType` one data type decorator from above.

```typescript
class Model {
    @StringType()
    @MapType()
    names: {[name: string]: string}; 
}
```

### Exclude

`@Exclude()` lets you exclude properties from a class in a certain
direction. Per default it excludes to export to `*toPlain` and
`*toMongo`. You can also use `@ExcludeToMongo` or `@ExcludeToPlain` to
have more control.

```typescript
class MyEntity {
    @ID()
    @ObjectID()
    id: string;
    
    @Exclude()
    internalState: string;
}
```

### ParentReference


`@ParentReference` together with `@Class` is used for all `*ToClass` functions
and allows you to have the parent from instance of class given in `@Class` assigned
as reference. Properties that used `@ParentReference` are automatically excluded
in `*ToPlain` and `*ToMongo` functions.

```typescript
class  Page {
    @StringType()
    name: string;
    
    @ClassArray(Page)
    children: Page[] = [];
    
    @Class(Page)
    @ParentReference()
    parent?: PageClass;
}

const root = plainToClass(Page, {
    name: 'Root',
    children: [
        {name: 'Child 1'},
        {name: 'Child 2'},
    ]
})

root.children[0].parent === root; //true
````

### OnLoad(options?: {fullLoad?: boolean})

With `@OnLoad` you can register one or multiple callbacks
for the onLoad lifetime event. The registered method is called
when the class has been instantiated with the `*ToClass` functions.

If `fullLoad` is true, the callback is called when the whole chain
of objects has been created, which means when all parents and siblings
are fully initialised.

### Decorator

`@Decorator` lets you transform the actual class into something
different. This is useful if you have in the actual class instance
(plainToClass or mongoToClass) a wrapper for a certain property, for
example `string[]` => `ChildrenCollection`.

```typescript
class ChildrenCollection {
    @Decorator()
    @StringType()
    @ArrayType()
    items: string[];
    
    constructor(items: string[]) {
        this.items = items;
    }
    
    public add(item: string) {
        this.items.push(item);
    }
}

class MyEntity {
    @ID()
    @ObjectID()
    id: string;
    
    //in *toMongo and *toPlain is children the value of ChildrenCollection::items
    @Class(ChildrenCollection)
    children: ChildrenCollection = new ChildrenCollection([]);
}
```

`ChildrenCollection` is now always used in *toClass calls. The
constructor of ChildrenCollection receives the actual value as
first argument.

```typescript
const entity = new MyEntity();
entity.children.add('Foo');
entity.children.add('Bar');
const result = classToPlain(entity);
/*
result = {
    id: 'abcde',
    children: ['Foo', 'Bar']
}
*/
````

If you read values from mongo or plain to class (mongoToClass,
plainToClass) your decorator will be used again and receives as first
argument the actual property value:

```typescript
const entity = plainToClass({
    id: 'abcde',
    children: ['Foo', 'Bar']
});
entity.children instanceof ChildrenCollection; //true

//so you can work with it again
entity.children.add('Bar2'); 
```

## Database

Marshal's MongoDB database abstraction makes it super easy to
retrieve and store data from and into your MongoDB. We make sure the
data from your JSON or class instance is correctly converted to MongoDB
specific types and inserted IDs are applied to your class instance.

```
npm install @marcj/marshal-mongo
```

```typescript
import {MongoClient} from "mongodb";
import {plainToClass} from "@marcj/marshal";
import {Database} from "@marcj/marshal-mongo";

const connection = await MongoClient.connect(
    'mongodb://localhost:27017', 
    {useNewUrlParser: true}
);
await connection.db('testing').dropDatabase();
const database = new Database(connection, 'testing');

const instance: SimpleModel = plainToClass(SimpleModel, {
    id: 'f2ee05ad-ca77-49ea-a571-8f0119e03038',
    name: 'myName',
});

await database.save(SimpleModel, instance);

const list: SimpleModel[] = await database.find(SimpleModel);
const oneItem: SimpleModel = await database.get(
    SimpleModel,
    {id: 'f2ee05ad-ca77-49ea-a571-8f0119e03038'}
);
```


## NestJS / Express


It's super common to accept data from a frontend via HTTP, transform the
body into your class instance, work with it, and then store that data in
your MongoDB or somewhere else. With Marshal this scenario is super
simple and you do not need any manual transformations.


```
npm install @marcj/marshal-nest
```

```typescript
import {
    Controller, Get, Param, Post, Body
} from '@nestjs/common';

import {SimpleModel} from "@marcj/marshal/tests/entities";
import {plainToClass, Database, classToPlain} from "@marcj/marshal";
import {ValidationPipe} from "@marcj/marshal-nest";
import {MongoClient} from "mongodb";

@Controller()
class MyController {
    
    private database: Database;
    
    private async getDatabase() {
        if (!this.database) {
            const connection = await MongoClient.connect(
                'mongodb://localhost:27017',
                {useNewUrlParser: true}
            );
            await connection.db('testing').dropDatabase();
            this.database = new Database(connection, 'testing');
        }
        
        return this.database;
    }
    
    @Post('/save')
    async save(
        @Body(ValidationPipe({transform: true})) body: SimpleModel,
    ) {
        body instanceof SimpleModel; // true;
        const versionNumber = await (await this.getDatabase()).save(SimpleModel, body);
        
        return body.id;
    }
    
    @Get('/get/:id')
    async get(@Param('id') id: string) {
        const instance = await (await this.getDatabase()).get(SimpleModel, {_id: id});

        return classToPlain(SimpleModel, instance);
    }
}

````

## Development of this package

How to release:

```
# remove packages/*/lib folders
# develop changes, run tests
./node_modules/.bin/jest --coverage

# build TS
lerna run tsc

# publish
lerna publish patch
```