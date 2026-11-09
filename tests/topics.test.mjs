import test from 'node:test';
import assert from 'node:assert/strict';
import { describeEntry, organizeTopics } from '../src/lib/topics.mjs';

const entry = (id, title, order = 0) => ({
  id,
  data: { title, description: '主题说明', order },
});

test('入口和嵌套笔记生成独立路径', () => {
  assert.deepEqual(describeEntry('physics/index'), {
    topic: 'physics',
    page: undefined,
    href: '/physics/',
  });
  assert.deepEqual(describeEntry('physics/notes/light'), {
    topic: 'physics',
    page: 'notes/light',
    href: '/physics/notes/light/',
  });
  assert.equal(describeEntry('physics/notes/index').href, '/physics/notes/');
});

test('主题只包含自己的内容并按顺序排列', () => {
  const topics = organizeTopics([
    entry('physics/notes', '物理笔记', 20),
    entry('math/index', '数学'),
    entry('physics/index', '物理'),
    entry('physics/mindmap', '物理导图', 10),
  ]);
  assert.equal(topics.length, 2);
  const physics = topics.find((topic) => topic.id === 'physics');
  assert.equal(physics.title, '物理');
  assert.deepEqual(
    physics.pages.map((page) => page.data.title),
    ['物理', '物理导图', '物理笔记'],
  );
  assert(physics.pages.every((page) => page.href.startsWith('/physics/')));
});

test('缺少独立入口的主题无法发布', () => {
  assert.throws(
    () => organizeTopics([entry('physics/notes', '笔记')]),
    /缺少入口/,
  );
});

test('重复发布路径必须在构建前发现', () => {
  assert.throws(
    () =>
      organizeTopics([
        entry('physics/index', '入口'),
        entry('physics/notes', '笔记'),
        entry('physics/notes/index', '重复笔记'),
      ]),
    /路径重复/,
  );
});

test('无效路径不能变成主题路由', () => {
  for (const id of [
    'index',
    'physics/../secret',
    'physics/',
    '../index',
    'physics/Notes',
  ]) {
    assert.throws(() => describeEntry(id), /无效/);
  }
});
