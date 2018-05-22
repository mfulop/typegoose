import * as mongoose from 'mongoose';
import * as tg from 'src/typegoose';

export class Animal extends tg.Typegoose {
  @tg.prop() _type: string;

  @tg.instanceMethod
  public getSound() {
    return null;
  }
}

export const AnimalModel = new Animal().getModelForClass(Animal, {
    schemaOptions: {
      collection: 'animals-extend-test',
      discriminatorKey: '_type',
    },
});
