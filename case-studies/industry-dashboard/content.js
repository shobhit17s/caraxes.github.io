/* content.js — the Industry Dashboard case study.

   EVERYTHING about this case study lives in this one file: its words, which
   template each slide uses, who the people are, what the drawers say, and
   what fills each media slot. No code here — just what the study is.

   A second case study is a second folder with its own content.js. It can
   tell a completely different story, in a different order, and still run on
   the same engine without a line of it changing.

   HOW A SLIDE IS WRITTEN
     { template: 'context-1', title: '…', body: '…', media: 'img-07-…' }
   `template` names one of the layout-spec templates (see system/js/
   cs-templates.js for the list). The rest are that template's slots.

   HOW A PICTURE IS NAMED
   A media slot is just a name. What fills it is decided once, in `media` at
   the bottom of this file. Leave a name out of that map and it renders as
   the labelled placeholder — which is a perfectly good answer while you are
   still drawing.
       img-…   a still image or diagram
       vid-…   a video, a gif, or a running prototype
*/
window.CS = window.CS || {};

CS.CASE_STUDY = {

  /* ---------------------------------------------------------------- meta */
  meta: {
    id: 'industry-dashboard',
    title: 'Evolution of the industry dashboard',
    subtitle: 'From scattered info. to an industry level view',
    backHref: '../../index.html',
    backLabel: 'back to the worlds',
    nutshellNote: 'Two pieces: who it was for, and what was built.',
    storyNote: 'Twenty-one slides, in order.'
  },

  /* ------------------------------------------------ in a nutshell (view 1) */
  nutshell: [
    { template: 'persona', id: 'cs-slide-persona', label: 'Who we designed for' },
    {
      group: 'app-landscape',
      id: 'cs-slide-landscape',
      label: 'The app landscape',
      logo: { template: 'logo', media: 'img-logo-mark',
              tiles: ['START tile', 'AUTH tile'] },
      kingdom: [
        { template: 'wireframe', id: 'cs-slide-wireframe' },
        { separator: 'wide' },
        { template: 'backend', id: 'cs-slide-backend' },
        { separator: 'medium' },
        { template: 'strip-figure', id: 'cs-slide-strip',
          media: 'img-strip-industry-map',
          caption: 'The whole landscape in one band — the drawing to check any single decision against.' }
      ]
    }
  ],

  /* -------------------------------------------- the detailed story (view 2) */
  story: [

    { template: 'hero', label: 'Title',
      title: 'Evolution of the industry dashboard',
      subtitle: 'From scattered info. to an industry level view',
      lead: 'A platform for providing industry insights to enrich the assessment of credit risk.',
      tags: ['Systems thinking', 'Dashboard design', 'Collaborative design',
             'Integration into existing systems'],
      artwork: 'art-hero-desk' },

    { template: 'context-1', label: 'The business problem', draft: true,
      title: 'The business problem',
      media: 'img-02-business-problem',
      body: [
        'Credit risk was being assessed client by client, with the industry around the client treated as background rather than evidence. The information existed &mdash; it was simply scattered, and no part of the platform was responsible for it.',
        'That left every analyst assembling the same industry picture privately, from different sources, with no way to show their working or to compare one judgement against another.'
      ] },

    { template: 'context-2', label: 'The struggles users were facing', draft: true,
      media: 'img-03-user-struggles',
      title: 'Gathering took longer than judging',
      body: 'Industry information had to be collected from several systems and several documents before any of it could be weighed. The slow part of the work was assembly, not analysis.',
      title2: 'Nothing said what mattered',
      body2: 'Once gathered, everything arrived at the same volume. There was no signal that one movement in an industry deserved attention and another did not &mdash; so either everything was checked, or nothing was.' },

    { template: 'context-2', label: 'To start off',
      media: 'img-04-what-existed',
      title: 'What already existed',
      body: 'This wasn&rsquo;t a greenfield ecosystem. Our analysts were already using the client dashboard to assess credit risk.',
      title2: 'The new experience',
      media2: 'img-04-new-experience' },

    { template: 'strip-text', label: 'The main design constraint',
      title: 'Main design constraint',
      impact: 'The new experience had to be an extension of the existing architecture rather than being a novel thing.' },

    { template: 'sections', label: 'Decoding the requirements',
      title: 'The initial brief', split: true,
      body: [
        { kind: 'quote', text: '&ldquo;Build a dashboard for monitoring Key Industry Drivers (KIDs)&rdquo;' },
        { kind: 'drawer', text: 'How each question was answered', drawer: 'questions' }
      ],
      title2: 'Open questions we had',
      body2: [{ kind: 'questions', wide: true, items: [
        'What constitutes a KID?',
        'How do analysts interpret them?',
        'How should they be organized?',
        'What does monitoring mean here?',
        'How do we segregate these insights between the 2 levels?',
        'How should users move between the 2 levels?',
        'How should these insights feed into client analysis?'
      ] }] },

    { template: 'context-1', label: 'Conducting research',
      title: 'Conducting research',
      media: 'img-07-research-synthesis',
      body: 'We gathered insights for our designs from SMEs and PMs. Here&rsquo;s what I understood:' },

    { template: 'strip-text', label: 'North star for UX',
      title: 'North star for UX &middot; UX principle',
      impact: 'Direct user attention towards signals worth investigating &amp; reduce noise.' },

    { template: 'title-figure-caption', label: 'Brainstorming ideas',
      title: 'Early concepts',
      media: 'img-09-early-concepts',
      caption: 'Brainstorming ideas.' },

    { template: 'context-2', label: 'Quick feedback from the working group',
      media: 'img-10-working-group',
      title: 'Rapid testing &amp; validation',
      body: [
        'We wanted to figure out which organisational model best supported the analytical task.',
        { kind: 'note', text: 'Potential users consulted: number needed' }
      ],
      title2: 'Feedback from Executive Director',
      body2: 'Strong preference for &ldquo;seeing drivers separated into positive &amp; negative impacts&rdquo;.' },

    { template: 'sections', label: 'Findings and realizations',
      title: 'Unexpected findings', split: true,
      body: [
        { kind: 'quote', text: '&ldquo;There&rsquo;s more to industries than just KIDs&rdquo;' },
        'Things such as rating trends, market info, news, emerging themes, SWOT assessments.',
        { kind: 'drawer', text: 'How the scope widened', drawer: 'scope' }
      ],
      title2: 'That&rsquo;s when the scope expanded',
      body2: [{ kind: 'flow', steps: [
        { text: 'KIDs page', quiet: true },
        { text: 'KIDs-based client-level insights', quiet: true },
        { text: 'Larger Industry Dashboard', note: 'more time, but more buy-in from stakeholders' },
        { text: 'Robust &amp; wholesome client-level insights', quiet: true }
      ] }] },

    { template: 'title-figure-caption', label: 'Product roadmap',
      eyebrow: 'Product roadmap', title: 'New product strategy', band: true,
      stage: { kind: 'flow', steps: [
        { label: 'Phase 1', text: 'KIDs page + partial integration into the client dashboard' },
        { label: 'Phase 2', text: 'Industry dashboard + client dashboard' }
      ] },
      caption: 'Phasing let the first useful thing ship without waiting for the wider dashboard.' },

    { template: 'strip-text', label: 'Immediate deliverables and scope',
      title: 'Immediate deliverables &amp; scope',
      impact: 'We focused first on Phase 1.' },

    { template: 'title-figure-caption', label: 'Design ideation, information architecture',
      title: 'Subsequent rounds of ideation',
      media: 'img-14-information-architecture',
      caption: 'Information Architecture.' },

    { template: 'title-figure-caption', label: 'Design ideation, page layouts',
      title: 'Design ideation',
      media: 'img-15-kids-page-layouts',
      caption: 'Ideation of the KIDs page layouts.' },

    { template: 'title-figure', label: 'Conflicts and tensions',
      draft: 'draft copy under each heading',
      eyebrow: 'Conflicts &amp; tensions', title: 'Balancing forces', band: true,
      stage: { kind: 'tiles', items: [
        { label: 'User needs', note: 'What the analysis actually required, which was more than the brief described.' },
        { label: 'Tech', note: 'What the existing architecture could carry without becoming a second system.' },
        { label: 'Product Requirements', note: 'What had been committed to, and by when.' },
        { label: 'Design System', note: 'What the platform already said, so the new pages read as part of it.' }
      ] } },

    { template: 'title-figure-caption', label: 'Rapid prototyping, option A',
      eyebrow: 'Rapid prototyping', title: 'Quick &amp; dirty prototype: Option A',
      media: 'vid-17-prototype-option-a',
      caption: 'Option A, put in front of the working group.' },

    { template: 'title-figure-caption', label: 'Rapid prototyping, option B',
      eyebrow: 'Rapid prototyping', title: 'Quick &amp; dirty prototype: Option B',
      media: 'vid-18-prototype-option-b',
      caption: 'Option B, put in front of the working group.' },

    { template: 'title-figure-caption', label: 'The final KIDs page',
      eyebrow: 'Final product, which was actually launched', title: 'Final KIDs Page',
      media: 'vid-19-final-kids-page',
      caption: 'Drivers separated by the direction of their impact &mdash; the arrangement testing asked for.' },

    { template: 'title-figure-caption', label: 'Partial integration with the client dashboard',
      eyebrow: 'Final product, which was actually launched',
      title: 'Partial integration with client dashboard',
      media: 'img-20-client-integration',
      caption: 'Phase 1 delivered: industry context inside the tool analysts already used.' },

    { template: 'title-figure', label: 'Feedback from real users',
      draft: 'numbers needed',
      eyebrow: 'Feedback from real users', title: 'Performance / Success Metrics', band: true,
      stage: { kind: 'tiles', items: [
        { label: 'Monthly usage', note: 'Figure to come.' },
        { label: 'User feedback &amp; surveys', note: 'Figure to come.' },
        { label: 'Adoption', note: 'Figure to come.' },
        { label: 'General engagement', note: 'Figure to come.' }
      ] } }
  ],

  /* ------------------------------------------------------- the people */
  tiles: ['Their week', 'What they want', 'What gets in the way', 'In their words'],

  personas: [
    { name: 'The credit analyst',
      meta: 'Primary user &middot; assesses client risk daily',
      media: 'img-persona-analyst',
      panels: [
        'PLACEHOLDER &mdash; a week of client assessments, each one needing industry context that currently has to be gathered from several places.',
        'PLACEHOLDER &mdash; to see what is moving in an industry without leaving the client they are assessing.',
        'PLACEHOLDER &mdash; industry information is scattered, and nothing says which of it is worth acting on.',
        'PLACEHOLDER &mdash; a quote from a real analyst goes here.'
      ] },
    { name: 'The executive director',
      meta: 'Working group &middot; quoted in the testing round',
      media: 'img-persona-director',
      panels: [
        'PLACEHOLDER &mdash; reviews the analysis rather than producing it, and needs to reach a judgement quickly.',
        'PLACEHOLDER &mdash; drivers arranged so the direction of impact is obvious at a glance.',
        'PLACEHOLDER &mdash; a flat list of drivers gives no sense of which way the industry is moving.',
        '&ldquo;Strong preference for seeing drivers separated into positive &amp; negative impacts.&rdquo;'
      ] },
    { name: 'The subject matter expert',
      meta: 'Consulted in research &middot; alongside the product managers',
      media: 'img-persona-sme',
      panels: [
        'PLACEHOLDER &mdash; holds the industry knowledge the dashboard has to encode.',
        'PLACEHOLDER &mdash; the reasoning behind a driver to survive the trip into the interface.',
        'PLACEHOLDER &mdash; judgement that is hard to reduce to a number or a tile.',
        'PLACEHOLDER &mdash; a quote from an SME goes here.'
      ] }
  ],

  /* --------------------------------- the wireframe slide's workflows */
  workflows: [
    { id: 'monitor', label: 'Monitor the drivers', shots: [
      { media: 'img-wf-monitor-1', caption: 'Drivers separated into positive and negative impacts — the arrangement the working group asked for.' },
      { media: 'img-wf-monitor-2', caption: 'Opening a driver without leaving the page, so the overview is never lost.' },
      { media: 'img-wf-monitor-3', caption: 'Signals worth investigating first; everything else stays available but quiet.' }
    ] },
    { id: 'client', label: 'Assess a client', shots: [
      { media: 'img-wf-client-1', caption: 'Phase 1 integration: industry context arrives inside the tool analysts already use.' },
      { media: 'img-wf-client-2', caption: 'The link that makes the industry view worth opening during a client assessment.' }
    ] },
    { id: 'industry', label: 'Explore an industry', shots: [
      { media: 'img-wf-industry-1', caption: 'Phase 2 — the scope that opened up once we learned there was more to an industry than its drivers.' },
      { media: 'img-wf-industry-2', caption: 'One of the four things the research turned up that the original brief had not asked for.' }
    ] }
  ],

  /* the secondary control beside the workflow tabs */
  workflowAction: { label: 'View workflow', drawer: 'questions' },

  /* ------------------------------ the backend slide's toggles */
  diagrams: [
    { id: 'ia', label: 'Information architecture', media: 'img-ia-structure',
      caption: 'The structure that answered three of the open questions at once: what a KID is, how KIDs are organised, and where the two levels meet.' },
    { id: 'integration', label: 'Integration with the client dashboard', media: 'img-ia-integration',
      caption: 'An extension of the architecture that was already there, rather than a second place to go.' }
  ],

  /* ------------------------------------------------------- the drawers */
  drawers: {
    questions: {
      title: 'How the open questions were answered',
      media: 'img-drawer-questions',
      caption: 'Diagram: the seven questions and where each one was settled.',
      body: [
        'PLACEHOLDER &mdash; this drawer is where the seven open questions get their answers, one short paragraph each.',
        'What a KID is, and how an analyst reads one, came out of the sessions with subject matter experts. How they are organised was settled in testing, by the preference for separating positive from negative impact.',
        'What monitoring means here, how the two levels are separated, how a reader moves between them, and how the insights feed back into client analysis were all settled by the information architecture on the short view of this case study.'
      ]
    },
    scope: {
      title: 'How the scope widened',
      media: 'img-drawer-scope',
      caption: 'Diagram: one page became a platform, in four steps.',
      body: [
        'PLACEHOLDER &mdash; the fuller version of the chain on the slide.',
        'The brief asked for a page for monitoring key industry drivers. Research showed that analysts also wanted rating trends, market information, news, emerging themes and SWOT assessments — none of which fit on a drivers page.',
        'Rather than refuse the extra scope or absorb it quietly, we put it to stakeholders as a phased product. The wider dashboard needed more time, but it drew more support, and phasing let the first useful thing ship without waiting for it.'
      ]
    }
  },

  /* ====================================================================
     WHAT FILLS EACH SLOT

     This map is the ONLY place that says what a media slot actually holds.
     Leave a name out and it renders as the drawn placeholder.

     Kinds:
       image     { kind:'image',  src:'assets/x.png' }
       video     { kind:'video',  src:'…mp4|gif', poster:'…', loop:true }
       figma     { kind:'figma',  src:'<figma share link OR embed url>' }
       local     { kind:'local',  src:'../../prototypes/<study>/x/index.html' }
       external  { kind:'external', src:'https://…' }

     Every kind takes: ratio ('16 / 9'), note, poster, autoload, startLabel.
     See prototypes/README.md for the full walkthrough.
     ==================================================================== */
  media: {
    /* Slots still waiting for artwork carry a note so the placeholder can
       say what belongs there. */
    'img-02-business-problem':        { note: 'Whatever best shows the gap: the assessment as it stood, or where industry context was missing from it.' },
    'img-03-user-struggles':          { note: 'The current journey, or the pile of sources an analyst works from.' },
    'img-04-what-existed':            { note: 'The client dashboard as it stood, before any industry context arrived in it.' },
    'img-04-new-experience':          { note: 'The industry level view the client dashboard could draw on.' },
    'img-07-research-synthesis':      { note: 'The synthesis of what the SMEs and product managers said.' },
    'img-09-early-concepts':          { note: 'Sketches from the first round of ideas.' },
    'img-10-working-group':           { note: 'The models that were put in front of the working group.' },
    'img-14-information-architecture': { note: 'The information architecture diagram.' },
    'img-15-kids-page-layouts':       { note: 'The layout options explored for the KIDs page.' },
    'img-20-client-integration':      { note: 'Where the industry insights surface inside the client dashboard.' },
    'img-logo-mark':                  { note: 'The product mark.' },
    'img-strip-industry-map':         { note: 'One wide view of the whole industry landscape.' },

    'img-persona-analyst':  { note: 'Portrait or working photograph of a credit analyst.' },
    'img-persona-director': { note: 'Portrait or working photograph of the executive director.' },
    'img-persona-sme':      { note: 'Portrait or working photograph of a subject matter expert.' },

    'img-wf-monitor-1': { note: 'The KIDs page as it opens: drivers grouped by the direction of their impact.' },
    'img-wf-monitor-2': { note: 'A single driver expanded, with its trend and the reasoning behind it.' },
    'img-wf-monitor-3': { note: 'Filtering the drivers down to the ones that moved this quarter.' },
    'img-wf-client-1':  { note: 'The existing client dashboard, with the new industry panel added.' },
    'img-wf-client-2':  { note: 'Following an industry driver through to the client it affects.' },
    'img-wf-industry-1': { note: 'The wider industry dashboard: ratings, market information, news, themes.' },
    'img-wf-industry-2': { note: 'A SWOT assessment sitting alongside the drivers.' },

    'img-ia-structure':   { note: 'How the two levels — industry and client — sit next to each other, and how a reader moves between them.' },
    'img-ia-integration': { note: 'Where the new industry panel plugs into the existing client dashboard.' },

    'img-drawer-questions': { note: 'The synthesis wall, or the page of the workbook where these were worked through.' },
    'img-drawer-scope':     { note: 'The four-step diagram of how the brief grew.' },

    /* The three prototype slots. Each is waiting for a real prototype —
       swapping one in is a change to these three lines and nothing else. */
    'vid-17-prototype-option-a': { wants: 'video', note: 'Walkthrough of the first organisational model.' },
    /* ↑ waiting for a prototype. To see the mechanism working, replace the
       line above with the one below — nothing else changes:

       'vid-17-prototype-option-a': {
         kind: 'local',
         src: '../../prototypes/industry-dashboard/demo/index.html',
         ratio: '16 / 9',
         note: 'Walkthrough of the first organisational model.'
       },
    */
    'vid-18-prototype-option-b': { wants: 'video', note: 'Walkthrough of the second organisational model.' },
    'vid-19-prototype-option-a': {
         kind: 'local',
         src: '../../prototypes/industry-dashboard/demo/index.html',
         ratio: '16 / 9',
         note: 'Walkthrough of the first organisational model.'
       },
  }
};
