export function describeEntry(id) {
  const [topic, ...parts] = id.split('/');
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic) ||
    !parts.length ||
    parts.some((part) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(part))
  ) {
    throw new Error(`无效的主题或页面标识：${id}`);
  }
  if (parts.at(-1) === 'index') parts.pop();
  const page = parts.join('/');
  return {
    topic,
    page: page || undefined,
    href: `/${topic}/${page ? `${page}/` : ''}`,
  };
}

export function organizeTopics(entries) {
  const topics = new Map();
  const urls = new Set();
  for (const entry of entries) {
    const route = describeEntry(entry.id);
    if (urls.has(route.href)) throw new Error(`页面路径重复：${route.href}`);
    urls.add(route.href);
    if (!topics.has(route.topic))
      topics.set(route.topic, { id: route.topic, pages: [] });
    topics.get(route.topic).pages.push({ ...entry, ...route });
  }
  for (const topic of topics.values()) {
    const index = topic.pages.find((page) => page.id === `${topic.id}/index`);
    if (!index) throw new Error(`主题缺少入口：topics/${topic.id}/index.md`);
    topic.title = index.data.title;
    topic.description = index.data.description;
    topic.href = index.href;
    topic.pages.sort(
      (a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id),
    );
  }
  return [...topics.values()].sort((a, b) => a.id.localeCompare(b.id));
}
