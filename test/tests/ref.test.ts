import { expect } from 'chai';

import { model as RefTestModel, RefTestBufferModel, RefTestNumberModel, RefTestStringModel } from '../models/refTests';

/**
 * Function to pass into describe
 * ->Important: you need to always bind this
 * @example
 * ```
 * import { suite as RefTests } from './ref.test'
 * ...
 * describe('Ref Tests', RefTests.bind(this));
 * ...
 * ```
 */
export function suite() {
  it('check generated ref schema for ObjectID _id', async () => {
    expect((RefTestModel.schema.path('refField') as any).instance).to.equal('ObjectID');
    expect((RefTestModel.schema.path('refField') as any).options.ref).to.equal('RefTest');
    expect((RefTestModel.schema.path('refField2') as any).instance).to.equal('ObjectID');
    expect((RefTestModel.schema.path('refField2') as any).options.ref).to.equal('RefTest');

    expect((RefTestModel.schema.path('refArray') as any).instance).to.equal('Array');
    expect((RefTestModel.schema.path('refArray') as any).caster.instance).to.equal('ObjectID');
    expect((RefTestModel.schema.path('refArray') as any).caster.options.ref).to.equal('RefTest');
    expect((RefTestModel.schema.path('refArray2') as any).instance).to.equal('Array');
    expect((RefTestModel.schema.path('refArray2') as any).caster.instance).to.equal('ObjectID');
    expect((RefTestModel.schema.path('refArray2') as any).caster.options.ref).to.equal('RefTest');
  });

  it('check generated ref schema for string _id', async () => {
    expect((RefTestModel.schema.path('refFieldString') as any).instance).to.equal('String');
    expect((RefTestModel.schema.path('refFieldString') as any).options.ref).to.equal('RefTestString');
    expect((RefTestModel.schema.path('refFieldString2') as any).instance).to.equal('String');
    expect((RefTestModel.schema.path('refFieldString2') as any).options.ref).to.equal('RefTestString');

    expect((RefTestModel.schema.path('refArrayString') as any).instance).to.equal('Array');
    expect((RefTestModel.schema.path('refArrayString') as any).caster.instance).to.equal('String');
    expect((RefTestModel.schema.path('refArrayString') as any).caster.options.ref).to.equal('RefTestString');
    expect((RefTestModel.schema.path('refArrayString2') as any).instance).to.equal('Array');
    expect((RefTestModel.schema.path('refArrayString2') as any).caster.instance).to.equal('String');
    expect((RefTestModel.schema.path('refArrayString2') as any).caster.options.ref).to.equal('RefTestString');
  });

  it('check generated ref schema for number _id', async () => {
    expect((RefTestModel.schema.path('refFieldNumber') as any).instance).to.equal('Number');
    expect((RefTestModel.schema.path('refFieldNumber') as any).options.ref).to.equal('RefTestNumber');
    expect((RefTestModel.schema.path('refFieldNumber2') as any).instance).to.equal('Number');
    expect((RefTestModel.schema.path('refFieldNumber2') as any).options.ref).to.equal('RefTestNumber');

    expect((RefTestModel.schema.path('refArrayNumber') as any).instance).to.equal('Array');
    expect((RefTestModel.schema.path('refArrayNumber') as any).caster.instance).to.equal('Number');
    expect((RefTestModel.schema.path('refArrayNumber') as any).caster.options.ref).to.equal('RefTestNumber');
    expect((RefTestModel.schema.path('refArrayNumber2') as any).instance).to.equal('Array');
    expect((RefTestModel.schema.path('refArrayNumber2') as any).caster.instance).to.equal('Number');
    expect((RefTestModel.schema.path('refArrayNumber2') as any).caster.options.ref).to.equal('RefTestNumber');
  });

  it('check generated ref schema for Buffer _id', async () => {
    expect((RefTestModel.schema.path('refFieldBuffer') as any).instance).to.equal('Buffer');
    expect((RefTestModel.schema.path('refFieldBuffer') as any).options.ref).to.equal('RefTestBuffer');
    expect((RefTestModel.schema.path('refFieldBuffer2') as any).instance).to.equal('Buffer');
    expect((RefTestModel.schema.path('refFieldBuffer2') as any).options.ref).to.equal('RefTestBuffer');

    expect((RefTestModel.schema.path('refArrayBuffer') as any).instance).to.equal('Array');
    expect((RefTestModel.schema.path('refArrayBuffer') as any).caster.instance).to.equal('Buffer');
    expect((RefTestModel.schema.path('refArrayBuffer') as any).caster.options.ref).to.equal('RefTestBuffer');
    expect((RefTestModel.schema.path('refArrayBuffer2') as any).instance).to.equal('Array');
    expect((RefTestModel.schema.path('refArrayBuffer2') as any).caster.instance).to.equal('Buffer');
    expect((RefTestModel.schema.path('refArrayBuffer2') as any).caster.options.ref).to.equal('RefTestBuffer');
  });

  it('check reference with string _id', async () => {
    const id1: string = 'testid1';
    const id2: string = 'testid2';

    const refTypeTest = new RefTestModel();
    refTypeTest.refFieldString = id1;
    refTypeTest.refArrayString = [id1, id2];
    refTypeTest.refFieldString = new RefTestStringModel();
    refTypeTest.refArrayString = [new RefTestStringModel(), new RefTestStringModel()];

    const { _id: _id1 } = await new RefTestStringModel({ _id: id1 }).save();
    expect(_id1).to.equal(id1);
    const { _id: _id2 } = await new RefTestStringModel({ _id: id2 }).save();
    expect(_id2).to.equal(id2);

    const { _id: refStringId } = await new RefTestModel({ refFieldString: _id1 }).save();
    const { refFieldString } = await RefTestModel.findById(refStringId);
    expect(refFieldString).to.equal(_id1);
    const { _id: refArrayId } = await new RefTestModel({ refArrayString: [_id1, _id2] }).save();
    const { refArrayString } = await RefTestModel.findById(refArrayId);
    expect(refArrayString).to.deep.equal([_id1, _id2]);
  });

  it('check reference with number _id', async () => {
    const id1 = 1234;
    const id2 = 5678;

    const refTypeTest = new RefTestModel();
    refTypeTest.refFieldNumber = id1;
    refTypeTest.refArrayNumber = [id1, id2];
    refTypeTest.refFieldNumber = new RefTestNumberModel();
    refTypeTest.refArrayNumber = [new RefTestNumberModel(), new RefTestNumberModel()];

    const { _id: _id1 } = await new RefTestNumberModel({ _id: id1 }).save();
    expect(_id1).to.equal(id1);
    const { _id: _id2 } = await new RefTestNumberModel({ _id: id2 }).save();
    expect(_id2).to.equal(id2);

    const { _id: refNumberId } = await new RefTestModel({ refFieldNumber: _id1 }).save();
    const { refFieldNumber } = await RefTestModel.findById(refNumberId);
    expect(refFieldNumber).to.equal(_id1);
    const { _id: refArrayId } = await new RefTestModel({ refArrayNumber: [_id1, _id2] }).save();
    const { refArrayNumber } = await RefTestModel.findById(refArrayId);
    expect(refArrayNumber).to.deep.equal([_id1, _id2]);
  });


  it('check reference with buffer _id', async () => {
    const id1 = Buffer.from([1, 2, 3, 4]);
    const id2 = Buffer.from([5, 6, 7, 8]);

    const refTypeTest = new RefTestModel();
    refTypeTest.refFieldBuffer = id1;
    refTypeTest.refArrayBuffer = [id1, id2];
    refTypeTest.refFieldBuffer = new RefTestBufferModel();
    refTypeTest.refArrayBuffer = [new RefTestBufferModel(), new RefTestBufferModel()];

    const { _id: _id1 } = await new RefTestBufferModel({ _id: id1 }).save();
    expect(_id1.equals(id1)).to.equal(true);
    const { _id: _id2 } = await new RefTestBufferModel({ _id: id2 }).save();
    expect(_id2.equals(id2)).to.equal(true);

    const { _id: refBufferId } = await new RefTestModel({ refFieldBuffer: _id1 }).save();
    const { refFieldBuffer } = await RefTestModel.findById(refBufferId);
    expect(_id1.equals(refFieldBuffer)).to.equal(true);
    const { _id: refArrayId } = await new RefTestModel({ refArrayBuffer: [_id1, _id2] }).save();
    const { refArrayBuffer } = await RefTestModel.findById(refArrayId);
    expect(refArrayBuffer).to.deep.equal([_id1, _id2]);
  });
}
