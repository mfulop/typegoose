import * as mongoose from 'mongoose';
import * as tg from 'src/typegoose';

export class Dog extends tg.Typegoose {
  @tg.prop() _type: string;
  @tg.prop() tailLength: string;

  @tg.instanceMethod
  public getSound() {
    return null;
  }
}

export const DogModel = new Dog().getModelForClass(Dog, {
    schemaOptions: {
      collection: 'dogs-extend-test',
      discriminatorKey: '_type',
    },
    mongooseSchemaExtend: true,
});
