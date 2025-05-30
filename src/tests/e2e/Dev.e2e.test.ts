import { Selector } from 'testcafe'

fixture('Dev.vue').page('http://localhost:8888/#/test')

test('Dev.vue contains Path', async (testController) => {
  const selector = Selector('#path')

  await testController.expect(selector.innerText).eql('Path: /test')
})
