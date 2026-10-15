const search = document.querySelector('#search');
const status = document.querySelector('#search-status');
const sections = [...document.querySelectorAll('.searchable-section')];
const rows = [...document.querySelectorAll('.command-row')];
const mobileToggle = document.querySelector('#mobile-nav-toggle');
const sidebar = document.querySelector('#side-nav');

function updateSearch() {
  const term = search.value.trim().toLocaleLowerCase('zh-CN');
  let visible = 0;
  for (const section of sections) {
    const sectionMatches = section.querySelector('.section-heading')?.textContent.toLocaleLowerCase('zh-CN').includes(term) ?? false;
    const sectionRows = [...section.querySelectorAll('.command-row')];
    for (const row of sectionRows) {
      row.hidden = !!term && !sectionMatches && !row.textContent.toLocaleLowerCase('zh-CN').includes(term);
      if (!row.hidden) visible += 1;
    }
    const faqMatch = section.id === 'faq' && section.textContent.toLocaleLowerCase('zh-CN').includes(term);
    section.hidden = !!term && !faqMatch && sectionRows.length > 0 && sectionRows.every(row => row.hidden);
    if (section.id === 'faq') section.hidden = !!term && !faqMatch;
  }
  if (term) {
    status.textContent = visible ? `找到 ${visible} 条相关用法。清空搜索可查看完整手册。` : '没有找到匹配的指令，换个关键词试试。';
  } else {
    status.innerHTML = '试试搜索：<button class="search-shortcut" data-term="运势">运势</button><button class="search-shortcut" data-term="抽签">抽签</button><button class="search-shortcut" data-term="搜图">搜图</button><button class="search-shortcut" data-term="总结">总结</button>';
  }
}

search.addEventListener('input', updateSearch);
document.addEventListener('click', async event => {
  const shortcut = event.target.closest('.search-shortcut');
  if (shortcut) {
    search.value = shortcut.dataset.term;
    updateSearch();
    search.focus();
    return;
  }
  const copy = event.target.closest('.copy-button');
  if (copy) {
    try {
      await navigator.clipboard.writeText(copy.dataset.copy);
      copy.textContent = '已复制';
      copy.classList.add('copied');
      window.setTimeout(() => { copy.textContent = '复制'; copy.classList.remove('copied'); }, 1600);
    } catch {
      copy.textContent = '复制失败';
      window.setTimeout(() => { copy.textContent = '复制'; }, 1600);
    }
  }
});

document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    search.focus();
    search.select();
  }
  if (event.key === 'Escape' && document.activeElement === search) {
    search.value = '';
    updateSearch();
    search.blur();
  }
});

mobileToggle.addEventListener('click', () => {
  const open = sidebar.classList.toggle('open');
  mobileToggle.setAttribute('aria-expanded', String(open));
});
sidebar.addEventListener('click', event => {
  if (event.target.closest('a')) {
    sidebar.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
  }
});

const navLinks = [...document.querySelectorAll('.side-nav a, .toc a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const first = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!first) return;
    for (const link of navLinks) link.classList.toggle('active', link.getAttribute('href') === `#${first.target.id}`);
  }, { rootMargin: '-90px 0px -60% 0px' });
  for (const section of document.querySelectorAll('.doc-section')) observer.observe(section);
}

