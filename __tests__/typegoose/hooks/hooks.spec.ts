import { model as Hook } from './hooktestModel';
import { model as Dummy } from './dummy';
import { initDatabase } from '__tests__/utils/mongoConnect';

describe('Hooks', () => {
  beforeEach(() => initDatabase());

  it('should update the property using isModified during pre save hook', async () => {
    const hook = await Hook.create({
      material: 'steel',
    });
    expect(hook.shape).toEqual('oldShape');

    hook.set('shape', 'changed');
    const savedHook = await hook.save();
    expect(savedHook.shape).toEqual('newShape');
  });

  it('should test findOne post hook', async () => {
    const dummy = await Dummy.create({ text: 'initial' });

    // text is changed in pre save hook
    const dummyFromDb = await Dummy.findOne({ text: 'saved' });
    expect(dummyFromDb.text).toEqual('changed in post findOne hook');
  });

  it('should find the unexpected dummies because of pre and post hooks', async () => {
    const dummy = await Dummy.create([{ text: 'whatever' }, { text: 'whatever' }]);

    const foundDummies = await Dummy.find({ text: 'saved'});

    // pre-save-hook changed text to saved
    expect(foundDummies.length).toEqual(2);
    expect(foundDummies[0].text).toEqual('changed in post find hook');
    expect(foundDummies[1].text).toEqual('saved');
  });
});
