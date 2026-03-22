# TODO App – Karla Tengström

A clean, modern task management app built as a JavaScript course project. Solo work!

---

## 🔗 Links

Live app: [tengska.netlify.app](https://karla-js-courseproject1.netlify.app/)  
Video presentation of the project (in Finnish): [Laurea Media](https://video.laurea.fi/media/Videoesittely%3A+JS+kurssin+ensim%C3%A4inen+projekti+%28Teht%C3%A4v%C3%A4lista-sovellus%29/0_3hn7q2lb)

---

## 👤 Work distribution

This was a solo project — I did everything myself (okay, Claude had my back), from planning the structure to writing the HTML, CSS, and JavaScript, all the way to deployment. No teammates to blame for the bugs. 😄

---

## 💭 My take on the project and what I learned

**What went well:**
Actually, everything? Building the whole i18n (language switching) system with Claude was something I'm actually proud of — using `data-i18n` attributes and a translations object felt like a nice solution. The dark/light mode toggle with localStorage persistence also came out nicely! The app is fully functional and meets all the requirements, plus a few extras I added along the way. It feels good to have built something from scratch without relying on any libraries.

**Room for improvement:**
The CSS grew a bit organically as features were added. If I did this again I'd probably think through the design system more carefully upfront.

**What's missing:**
Drag & drop reordering would be a cool addition! Maybe editing existing tasks in place too — right now you have to delete and re-add. 🤔

**What I learned:**
A lot about DOM manipulation without leaning on any libraries, how localStorage works in practice, and how to structure a slightly larger vanilla JS app without it turning into spaghetti. CSS custom properties (variables) for theming were a revelation - made the dark/light mode toggle way easier to implement. Also got more comfortable with event delegation and working with dates in JavaScript.

**Things still unclear:**
Getting smoother with async JS and fetch — that's the next thing to properly dig into. Also, I know there are some best practices around structuring larger vanilla JS apps that I haven't fully internalized yet. I'm sure there's room to make the code cleaner and more modular.

**Self-assessment:**
I think I hit all the major requirements and added some nice extras, but there's always room to polish the code and UX further. Overall I'm happy with how it turned out and what I learned along the way. Minus point for using Claude as an AI assistant — I know we were supposed to do it "all" ourselves, but I couldn't resist getting some help with planning, debugging and building more advanced features. 😅

| Criteria | Points available | My score |
| --- | --- | --- |
| Code is commented | 1 p | 1 p |
| App functionality meets the set requirements and works without errors | 3 p | 3 p |
| App appearance is polished | 1 p | 1 p |
| Code is published on GitHub. A README file has also been created. | 2 p | 2 p |
| App is published on Netlify or equivalent hosting service | 1 p | 1 p |
| A video demo of the app has been made | 2 p | 1 p |
| **Total** | **10 p** | **9 p** |

---

---

## Table of contents

- [🔗 Links](#-links)
- [👤 Work distribution](#-work-distribution)
- [💭 My take on the project and what I learned](#-my-take-on-the-project-and-what-i-learned)
- [Table of contents](#table-of-contents)
- [About the app](#about-the-app)
- [Known bugs](#known-bugs)
- [Screenshot of the app](#screenshot-of-the-app)
- [Technologies](#technologies)
- [Installation](#installation)
- [Credits](#credits)
- [License](#license)

---

## About the app

**TODO App** is a browser-based task manager that lets you add, complete, and delete tasks — with a few extra touches to make it actually pleasant to use.

**Features:**

- Add tasks with priority level (high / normal / low), optional due date, and an "important" flag
- Mark tasks as done or delete them
- Filter view: All / Active / Done / Important
- Live counter showing how many tasks are open
- Overdue task detection with a warning badge
- Dark & light mode toggle (saved to localStorage)
- Finnish / English language toggle (also saved)
- All data persists in localStorage — nothing gets lost on refresh

---

## Known bugs

Nothing critical found so far. The app works as expected across Chrome and Firefox.
If something is off, please let me know!

---

## Screenshot of the app

![Screenshot of the TODO App](/images/app_screenshot.png)

---

## Technologies

| Technology | Role |
| --- | --- |
| `HTML5` | Structure and semantic markup |
| `CSS3` | Styling — external file, CSS custom properties for theming |
| `JavaScript (ES6+)` | All app logic — external file, no libraries |
| `localStorage` | Persisting tasks, theme preference, and language setting |
| `Google Fonts` | Permanent Marker font for the app title |
| `Netlify` | Hosting and (auto-deployment) |
| `GitHub` | Version control |

No jQuery, no frameworks, no external JS libraries — just native browser APIs.

---

## Installation

No build steps needed.

1. Clone or download the repository
2. Open `index.html` in your browser

That's it. Everything runs client-side.

```bash
git clone https://github.com/tengska/js-project1.git
cd js-project1
# open index.html in your browser
```

---

## Credits

- [Google Fonts – Permanent Marker](https://fonts.google.com/specimen/Permanent+Marker) — title font
- [Claude (Anthropic)](https://claude.ai) — used as an AI coding assistant during development to help plan features, write and review code, and work through implementation details. A M A Z I N G!
- MDN Web Docs — go-to reference for DOM APIs and localStorage

---

## License

MIT License © Karla Tengström

Feel free to use, modify, or build on this — just keep the attribution.
