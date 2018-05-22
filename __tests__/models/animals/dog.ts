import * as mongoose from 'mongoose';
import * as tg from 'src/typegoose';
import { Animal }  from './animal';
export class Dog extends Animal {
  @tg.prop() _type: string;
  @tg.prop() tailLength: string;

  @tg.instanceMethod
  public getSound() {
    return 'im a dog';
  }
}

export const DogModel = new Dog().getModelForClass(Dog);
