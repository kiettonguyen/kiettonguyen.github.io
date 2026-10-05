"""Builds the project case-study pages from the content below.

    python3 scripts/build_case_studies.py

Writes work/<slug>/index.html.
Edit project text here (not in the generated pages), then re-run.
"""
import html, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
e = html.escape

# The Living Museum card sort, redrawn as text on the paper (the original was a dark screenshot)
CARD_SORT = (
    '<figure class="cs-media wide plate sort-fig"><div class="sort">'
    '<div class="sort-col"><h4>Homepage <small>4 cards</small></h4><p class="sort-card">Acknowledgements</p><p class="sort-card">Event / exhibition / workshop schedule or calendar</p><p class="sort-card">Storytelling concept: objects users hover for more info</p><p class="sort-card">What’s on / news (quick view)</p><p class="sort-card loose">News page / blog</p></div>'
    '<div class="sort-col"><h4>About <small>3 cards</small></h4><p class="sort-card">Pipemakers Park</p><p class="sort-card">About us</p><p class="sort-card">Buildings + facilities</p><p class="sort-card loose">FAQ?</p></div>'
    '<div class="sort-col"><h4>Digital library / catalogue <small>5 cards</small></h4><p class="sort-card">Browsing section</p><p class="sort-card">Reference enquiry</p><p class="sort-card">Search function</p><p class="sort-card">“Cart”: favourites</p><p class="sort-card">Research</p><p class="sort-card loose">Login</p></div>'
    '<div class="sort-col"><h4>Contact <small>3 cards</small></h4><p class="sort-card">Possible footer</p><p class="sort-card">Enquiries (pop-up)</p><p class="sort-card">Digital donor wall</p><p class="sort-card loose">FAQ?</p></div>'
    '<div class="sort-col"><h4>Projects <small>5 cards</small></h4><div class="sort-card"><strong>Student / university projects</strong><ul><li>Student research and residency program</li><li>Student work experience program</li></ul></div><div class="sort-card"><strong>Historical projects</strong><ul><li>Footscray wharves and environs</li></ul></div><div class="sort-card"><strong>Art / exhibition project</strong><ul><li>Artist in residency program: timeline</li><li>Contemporary art exhibition program: current exhibitions timeline</li><li>Past arts events projects</li></ul></div><div class="sort-card"><strong>Aboriginal program</strong><ul><li>Local history</li><li>Program</li></ul></div><p class="sort-card">Projects timeline</p></div>'
    '</div><figcaption>Card sorting results, redrawn from the team’s board</figcaption></figure>'
)

P = [
  dict(
    slug="indigenous-inclusion", title="Indigenous Inclusion Storyline", year="2023",
    tags=["e-Learning", "Illustration", "Motion"],
    lead="The primary objective of this module is to educate individuals without prior foundational knowledge, fostering awareness and understanding of the experiences, challenges, and contributions of Aboriginal Australians.",
    cover=("video", "02"),
    blocks=[
      ("h", "My Role"),
      ("p", "I was assigned this project to create a piece of e-Learning and create a fresh perspective/outlook on an older PowerPoint."),
      ("p", "I was acutely aware of the importance of accurate representation and cultural authenticity. To ensure a respectful and genuine portrayal of the topic, I actively sought the guidance and collaboration of a subject matter expert who is an Aboriginal Australian. This collaborative engagement was foundational in shaping the content and approach of the e-Learning module."),
      ("img", "01.png", "Storyline structure map for the module", "wide plate"),
      ("h", "Storytelling through imagery and motion effects"),
      ("p", "This e-Learning module emphasises a story-driven approach, leveraging animations and moving visual effects to engage and immerse learners. The stories shared within this module highlight the historical context, cultural practices, and the ongoing journey of Aboriginal Australians, providing a platform for empathy, reflection, and learning."),
      ("p", "I thought of ways to animate and showcase what the sophisticated systems that the Aboriginal Australians had would look like. I created an isometric illustration of land, water and the skies to portray this."),
      ("video", "02", "Animated module slides"),
      ("h", "Inspiring reconciliation"),
      ("p", "By sharing personal stories, cultural insights, and showcasing the impact of historical events, the module seeks to sensitise learners and ignite a desire for positive change."),
      ("p", "Through this immersive approach, the module aims to empower learners to take meaningful steps towards reconciliation and inclusion in today's society."),
      ("video", "03", "Module transition animation"),
      ("h", "A brief look into their history"),
      ("p", "Creating a dynamic timeline that emphasises Aboriginal Australian history, exploring the history and experiences of Aboriginal Australians, aiming to raise awareness and foster a deeper understanding of their culture, struggles, and aspirations."),
      ("video", "04", "Timeline introduction animation"),
      ("h", "Demo"),
      ("yt", "luMdhMKW2H0", "Indigenous Inclusion Storyline demo"),
    ]),
  dict(
    slug="motivational-interviewing", title="Motivational Interviewing e-Learning", year="2023",
    tags=["e-Learning", "Articulate Rise", "Vyond"],
    lead="Motivational Interviewing is a concept that recurs a lot within the mental health space. This e-Learning module aims to provide a comprehensive understanding of MI principles, techniques, and applications.",
    cover=("video", "01"),
    blocks=[
      ("p", "I built this e-Learning using Articulate Rise, with imagery personally developed using Adobe Illustrator and animated GIFs produced in Vyond."),
      ("h", "Fostering accessibility"),
      ("p", "This e-Learning caters to professionals seeking to enhance their communication skills and effectively support clients in making positive behavioural changes, ultimately promoting a more client-focused and collaborative approach in their respective fields."),
      ("p", "Typically these professionals exist outside of the realm of psychologists and therapists. They may include support workers, carers and mental health workers. In this case, ensuring that complex terms and concepts are broken down into simpler parts is important."),
      ("video", "01", "Scrolling through the Rise module"),
      ("h", "Creating relatable scenarios"),
      ("p", "Using Vyond to create animated GIFs adds an extra layer of dimension to the e-Learning, bringing character emotions and real-world scenarios to life."),
      ("video", "02", "Affirmations section of the module"),
      ("h", "Quizzing"),
      ("p", "These quizzes serve as effective reinforcement tools, allowing learners to review and reinforce their understanding of key concepts in a non-intimidating manner."),
      ("p", "By keeping the quizzes simple and approachable, we strike a balance that encourages engagement and boosts confidence without overwhelming the learner."),
      ("video", "03", "Knowledge check quiz"),
      ("h", "Demo"),
      ("yt", "HkLfDeUG1Hw", "Motivational Interviewing e-Learning demo"),
    ]),
  dict(
    slug="mamaskangaroo", title="Mamas Kangaroo", year="2021",
    tags=["E-commerce", "Branding", "UX/UI", "Shopify"],
    lead="As a startup, Mamas Kangaroo envisioned an e-commerce platform that served as a one-stop shop for expectant mothers to find supplies for their upcoming lives as mothers — and a communication platform for expectant mothers and new families.",
    cover=("video", "06"),
    blocks=[
      ("p", "They also provided pregnancy and baby advice from the perspective of parenthood during times of lockdowns, supporting parents-to-be on their journey from bump to baby and beyond by connecting mothers with experts and providing online resources."),
      ("h", "My Role"),
      ("p", "My role saw me in two main areas: the design space and the marketing space."),
      ("p", "I was tasked with building the website using Shopify and creating a customer/user experience that not only flowed well but was easy and straightforward to use for the target audience of expectant mothers. Furthermore, I led the development of the branding and visual design of the e-commerce platform, creating a space that was both aesthetic and relevant to a motherly theme."),
      ("p", "I actively optimised the Shopify app's SEO and implemented strategic Google Ads campaigns to ensure enhanced visibility, increased traffic, and conversions."),
      ("h", "Information Architecture"),
      ("p", "Considering the target audience of expectant mothers, creating a basic and simple web structure is important. I built an information architecture diagram to map out the priorities of the customer. Bringing focus to a user-friendly customer journey, the diagram aims to direct customers to checkout as seamlessly as possible."),
      ("p", "With a theme-coded website builder like Shopify, I ensured that only key pages and functions are mapped out, to prevent any roadblocks in cases where certain functions are ambitious to create in the builder."),
      ("img", "02.png", "Information architecture diagram", "wide plate"),
      ("h", "E-Commerce Friendly"),
      ("p", "E-commerce sites can be tricky to develop, especially when using a theme-coded builder such as Shopify. Creating wireframes that are simple, easy to build and modular is the most effective directive to prevent redesigning in cases where the builder is not able to replicate the design."),
      ("p", "Hence, I created a system of wireframes that understands the ecosystem of Shopify and presents itself in a modular manner."),
      ("gallery", [("img", "03.png", "Home page wireframe"), ("img", "04.png", "Contact page wireframe"), ("img", "05.png", "Product list wireframe")]),
      ("h", "Visual Identity"),
      ("p", "Building an identity to appeal to expectant mothers and create a user-friendly interface is a focal point in ensuring users' needs are met. Focusing on bringing the colour palette close to a nude scheme emphasises the rawness and purity of pregnancy."),
      ("p", "Using large, clear images and soft typefaces gives the brand its nurturing appearance."),
      ("video", "06", "Home page high-fidelity design"),
      ("h", "Design for Seamless User Experience"),
      ("p", "Fleshing out the rest of the pages and shaping the website all together. High-fidelity prototyping was an important step in allowing me to build these later on in Shopify."),
      ("gallery", [("video", "07", "Page prototype"), ("video", "08", "Page prototype")]),
      ("h", "Efficient Checkout"),
      ("p", "After discussing with various stakeholders, we decided an easy-access cart was needed for direct access. A sidebar checkout reduces the number of clicks from different pages to reach the cart. By removing the need for the cart to be on a page of its own, users are less likely to be lost on the website and this allows quicker access to the checkout page."),
      ("video", "09", "Sidebar cart interaction"),
      ("h", "Final Thoughts"),
      ("p", "I'm super excited that Mamas Kangaroo was able to launch successfully and oversaw expansion across the UK and in Australia. Some key takeaways involved understanding theme-coded builders like Shopify and their interaction with the design process. Ultimately, it can be very frustrating trying to replicate prototypes that aren't as viable in application."),
    ]),
  dict(
    slug="melbourne-hack-2021", title="Melbourne Hack 2021", subtitle="1st Place", year="2021",
    tags=["Hackathon", "Product Design", "Branding"],
    lead="AnyExercise encourages the elderly to exercise at home. We engage with users through gamification, guiding them into correct forms via pose detection and a simple UI which makes it easy for seniors.",
    cover=("img", "03.png"),
    blocks=[
      ("p", "As a spoiler, we did end up winning both 1st place and also the 'Greatest Maker' Arcitecta Sponsor Prize."),
      ("img", "01.png", "AnyExercise mascot illustration", "small bare"),
      ("h", "The Covid Slump"),
      ("p", "With consecutive lockdowns in Melbourne, the closure of public spaces and gyms, it has become increasingly difficult for elderly people such as our grandparents to find the motivation to exercise, as it has simply become too inconvenient. We hence identified that this was a niche issue that had potential to be explored."),
      ("h", "An opportunity to improve at-home exercise"),
      ("p", "Falling has always been a concern for older people. The Australian and New Zealand Falls Prevention Society found that for those over 65 years old, falls account for 40% of injury-related deaths. According to Better Health Victoria, many older people stop physical exercise due to beliefs that exercise is no longer appropriate. Common misconceptions include:"),
      ("ul", ["Older people are frail and physically weak.",
              "The human body doesn't need as much physical activity as it ages.",
              "Exercising is hazardous for older people because they may injure themselves.",
              "Only vigorous and sustained exercise is of any use."]),
      ("p", "However, if you don't use it, you lose it. Better Health Victoria estimates that a lack of physical activity accounts for about half of the physical decline associated with ageing such as reduced muscle mass, strength and physical endurance, coordination and balance, joint flexibility and mobility, and bone strength."),
      ("h", "My Role"),
      ("p", "I played a pivotal role in leading and overseeing the overall design strategy and direction for the project. My responsibilities encompassed a broad spectrum, including creating wireframes, developing prototypes, defining branding elements, and enhancing user interactions to ensure a seamless and engaging user experience."),
      ("h", "A gamified web app"),
      ("p", "Much of the inspiration for the app was drawn from what was currently on the market. Looking at games such as Ring Fit or Wii Fit and how exactly users can enjoy exercise was important. We added things like trackers and progress bars so that users would feel accomplished and encouraged to continue. We sought research from psychologists that suggested positive reinforcement was beneficial in encouraging users to keep an exercise routine and habit."),
      ("img", "02.jpg", "Wireframe flow", "wide"),
      ("h", "The Product"),
      ("p", "AnyExercise is a web platform that utilises AI pose detection to determine correct form during exercises."),
      ("p", "Additionally, the targeted challenges and trackers encourage older people to create a healthy habit and consistent pattern of physical activity. Pose detection during exercises gives real-time feedback on your progression of the activity."),
      ("p", "A clean and minimalistic UI aids older users in tracking their progress with each exercise and also a visual guide on correctly matching the pose."),
      ("img", "03.png", "AnyExercise dashboard UI", "wide"),
      ("h", "Check out our Devpost!"),
      ("p", "Surprisingly, we won our first hackathon ever!"),
      ("link", "https://devpost.com/software/anyexercise", "View AnyExercise on Devpost"),
    ]),
  dict(
    slug="living-museum-of-the-west", title="Living Museum of the West", year="2021",
    tags=["UX/UI", "Branding", "Web"],
    lead="Founded in 1984, Melbourne's Living Museum of the West is an ecomuseum located at Pipemakers Park, Maribyrnong. It acts as an archive hub for researchers looking to learn more about West Melbourne's past through recorded storytelling.",
    cover=("video", "01"),
    blocks=[
      ("video", "01", "Living Museum logo animation", "medium plate"),
      ("h", "The Brief"),
      ("p", "The Living Museum had been hoping to reinvigorate and expand its subjective story collection in contemporary ways. Part of this goal is achieved through increasing their website accessibility. It is important the museum expresses its non-compartmentalised nature through a modern website framework as a contemporary reinvention. We were tasked to produce a branding and UX refresh of the museum's website in both desktop and mobile iterations."),
      ("h", "Our Concept"),
      ("p", "During the research phase, we determined there were two main user categories:"),
      ("cards", [("Purposeful Users", "People who come to the website with a goal in mind. Whether they are researchers, regular visitors or those wishing to lodge complaints, they all wish to access specific parts of the website quickly and purposefully."),
                 ("Wanderers", "People who enter the website by chance or for the first time. They wish to browse and explore what the museum is all about while picking up little bits of inspiration on the way. Perhaps they are looking for a fun weekend activity or wishing to procrastinate while learning something new.")]),
      ("h", "Our Goals"),
      ("ul", ["Look at heritage through a critical lens — the early celebratory tone around industrial and agricultural histories was, in retrospect, quite destructive to Indigenous environments.",
              "Bring in new perspectives.",
              "Increase accessibility."]),
      ("h", "My Role"),
      ("p", "I worked in a team of 5 to curate and give the museum's website a refresh. Overall, I worked to create reusable components and prototyped important interactivity functions such as the menu, navigation bar and footers."),
      ("h", "Style Guide"),
      ("split", ("img", "02.png", "Style guide colour swatches"), [
        ("specs", [("Colour scheme", "Swatched from the entrance map"),
                   ("Headings — Futura PT Demi", "Used for consistency with the logo. Matches the contemporary reinvention style, in line with Bauhaus aesthetics."),
                   ("Body — Open Sans", "A humanist sans serif that is highly optimised for web and mobile interfaces. Its neutral, friendly appearance and high legibility fit the contemporary reinvention scheme. Open Sans also has ties to open-source data and wikis, matching the museum's values as a place to gain knowledge without borders."),
                   ("Type scale", "60pt H1 · 36pt H2 · 20pt H3 · 20pt body")]),
      ]),
      ("h", "Card Sorting"),
      ("p", "By employing this user-centred design technique, I gathered valuable insights into how users naturally categorise and prioritise information."),
      ("p", "Our group was presented with various content elements in the form of digital 'cards' and asked to categorise them based on their perceived relationships and importance. The results provided a clear understanding of users' mental models and preferences, enabling a well-structured and intuitive navigation system."),
      ("raw", CARD_SORT),
      ("h", "Creating an initial system"),
      ("p", "Part of the challenge of reorganising such a large archive of information and pages is managing the information architecture and how it flows. These are some initial wireframes we made to understand the order of the user experience and flow of the customer journey."),
      ("img", "04.png", "Initial wireframes", "wide plate"),
      ("h", "Implementing a Grid System"),
      ("p", "We revisited the drawing board to find more efficient ways to display the content. Due to the astronomical amount of text within the museum website, it was imperative to break the verticality of the site. This helps reduce user frustration as users don't have to scroll so far to find their information."),
      ("ul", ["Using a grid system improves space efficiency and allows for less verticality.",
              "Having everything properly aligned increases usability, as elements are easy to track and find.",
              "Within each project, breaking up the page into blocks reduces huge chunks of text and allocates a visual to each text."]),
      ("gallery", [("img", "05.png", "Projects overview page"), ("img", "06.png", "Art projects page"),
                   ("img", "07.png", "History and community projects page"), ("img", "08.png", "Student projects page")], "plate"),
      ("h", "Demo"),
      ("yt", "GURWAT-_vqU", "The Living Museum Website [Desktop]"),
      ("yt", "LWNiWBBJUT0", "The Living Museum Website [Mobile]"),
    ]),
]


def media(kind, file, alt, cls=""):
    if kind == "img":
        return f'<img src="{file}" alt="{e(alt)}" loading="lazy" data-zoom>'
    # looping, muted video converted from the original GIF
    return (f'<video src="{file}.mp4" poster="{file}-poster.jpg" muted loop playsinline '
            f'preload="none" data-autoplay aria-label="{e(alt)}"></video>')


def render_block(b, a):
    t = b[0]
    if t == "raw":
        return b[1]
    if t == "h":
        return f'<h2 class="cs-h">{e(b[1])}</h2>'
    if t == "p":
        return f'<p>{e(b[1])}</p>'
    if t == "ul":
        return '<ul class="cs-list">' + "".join(f"<li>{e(x)}</li>" for x in b[1]) + "</ul>"
    if t in ("img", "video"):
        size = b[3] if len(b) > 3 else "wide"
        f = a + b[1]
        return f'<figure class="cs-media {size}">{media(t, f, b[2])}</figure>'
    if t == "gallery":
        items = "".join(f'<figure class="cs-media">{media(k, a + f, alt)}</figure>' for k, f, alt in b[1])
        extra = f" {b[2]}" if len(b) > 2 else ""
        return f'<div class="cs-gallery n{len(b[1])}{extra}">{items}</div>'
    if t == "yt":
        return (f'<figure class="cs-media wide yt"><iframe src="https://www.youtube-nocookie.com/embed/{b[1]}" '
                f'title="{e(b[2])}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'
                f'<figcaption>{e(b[2])}</figcaption></figure>')
    if t == "link":
        return f'<p><a class="cs-link" href="{b[1]}" target="_blank" rel="noopener">{e(b[2])} ↗</a></p>'
    if t == "cards":
        return '<div class="cs-cards">' + "".join(
            f'<div class="cs-card"><h3>{e(h)}</h3><p>{e(p)}</p></div>' for h, p in b[1]) + "</div>"
    if t == "specs":
        return '<dl class="cs-specs">' + "".join(f"<dt>{e(k)}</dt><dd>{e(v)}</dd>" for k, v in b[1]) + "</dl>"
    if t == "split":
        left = render_block(b[1] + ("small plate",), a)  # the style guide sits on a soft plate
        right = "".join(render_block(x, a) for x in b[2])
        return f'<div class="cs-split">{left}<div>{right}</div></div>'
    raise ValueError(t)


FIG = {"indigenous-inclusion": "2.1", "motivational-interviewing": "2.2", "mamaskangaroo": "2.3",
       "living-museum-of-the-west": "2.4", "melbourne-hack-2021": "2.5"}


def page(i, p):
    up = "../../"
    a = f"{up}assets/{p['slug']}/"
    css, js = "../../style.css", "../../script.js"
    nxt = P[(i + 1) % len(P)]
    tags = "".join(f"<li>{e(t)}</li>" for t in p["tags"])
    sub = f' <em>({e(p["subtitle"])})</em>' if p.get("subtitle") else ""
    body = "\n      ".join(render_block(b, a) for b in p["blocks"])
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{e(p['title'])} — 阮 Kiet Nguyen</title>
  <meta name="description" content="{e(p['lead'])}">
  <link rel="icon" href="../../favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@300;400;500&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Klee+One:wght@600&text=%E9%98%AE&display=block" rel="stylesheet">
  <link rel="stylesheet" href="{up}shared/board.css?v=16">
  <link rel="stylesheet" href="{css}?v=16">
</head>
<body class="case-study" style="--fig: '{FIG[p['slug']]}'">
  <header class="toolbar">
    <a href="../../" class="logo"><svg class="seal" viewBox="0 0 40 40" aria-hidden="true"><filter id="pen" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="2" seed="21"/><feDisplacementMap in="SourceGraphic" scale="1.1" xChannelSelector="R" yChannelSelector="G"/></filter><text x="20" y="21" text-anchor="middle" dominant-baseline="central" filter="url(#pen)">阮</text></svg><span class="logo-text"><span class="logo-name">Kiet Nguyen</span><span class="logo-fig">fig. 00 · 阮, the lute</span></span></a>
  </header>

  <main>
    <section class="cs-hero">
      <a class="back" href="../../#work">← fig. 02 · all work</a>
      <p class="cs-year">{p['year']}</p>
      <h1>{e(p['title'])}{sub}</h1>
      <ul class="tags">{tags}</ul>
      <p class="cs-lead">{e(p['lead'])}</p>
    </section>

    <article class="cs-body">
      {body}
    </article>

    <a class="next-project" href="../{nxt['slug']}/">
      <span>Next project</span>
      <strong>{e(nxt['title'])} →</strong>
    </a>
  </main>

  <footer class="site-footer">
    <p>&copy; <span class="year"></span> Kiet Nguyen <span class="end">· end of figures</span></p>
    <a href="https://www.linkedin.com/in/kietngu" target="_blank" rel="noopener">LinkedIn ↗</a>
  </footer>

  <div class="lightbox" hidden><img alt=""></div>
  <script src="{js}?v=16"></script>
</body>
</html>
"""



for i, p in enumerate(P):
    d = os.path.join(ROOT, "work", p["slug"])
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, "index.html"), "w", encoding="utf-8") as f:
        f.write(page(i, p))
print("built", len(P), "case studies")
