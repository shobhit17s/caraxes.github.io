/* cs-config.js — everything about this case study that is not prose.
   Prose lives in index.html; this file holds the moving parts: the workflows
   behind the wireframe carousel, the people, the diagrams, the drawer texts.

   NAMING OF ARTWORK
   Every picture on this page is a slot with a name. When a real file arrives,
   it takes the slot's name and drops in. Two prefixes, nothing else:
       img-...   a still image or diagram        (drawn in the red accent)
       vid-...   a video or embedded prototype   (drawn in the purple accent)
   Story slides carry their slide number: img-04-existing-vs-new.
   The pieces in the short view are named by what they are: img-persona-1,
   img-wf-monitor-2, img-ia-structure. */
window.CS = window.CS || {};
(function (CS) {
  'use strict';

  CS.META = {
    title: 'Evolution of the industry dashboard',
    subtitle: 'From scattered info. to an industry level view',
    backHref: '../index.html',
    backLabel: 'back to the worlds'
  };

  /* Stroke-layer settings, as settled in the stroke lab. */
  CS.STROKE = {
    roughness: 3.2,
    detail: 24,
    pressure: 0.39,
    overshoot: 0.018,
    passes: 2,
    baseWidth: 1.7,
    texture: false
  };

  /* The wireframe slide: each tab is a workflow, each workflow a set of
     screens. Every screen is a slot waiting for a real image. */
  CS.WORKFLOWS = [
    {
      id: 'monitor',
      label: 'Monitor the drivers',
      shots: [
        { name: 'img-wf-monitor-1', note: 'The KIDs page as it opens: drivers grouped by the direction of their impact.',
          caption: 'Drivers separated into positive and negative impacts — the arrangement the working group asked for.' },
        { name: 'img-wf-monitor-2', note: 'A single driver expanded, with its trend and the reasoning behind it.',
          caption: 'Opening a driver without leaving the page, so the overview is never lost.' },
        { name: 'img-wf-monitor-3', note: 'Filtering the drivers down to the ones that moved this quarter.',
          caption: 'Signals worth investigating first; everything else stays available but quiet.' }
      ]
    },
    {
      id: 'client',
      label: 'Assess a client',
      shots: [
        { name: 'img-wf-client-1', note: 'The existing client dashboard, with the new industry panel added.',
          caption: 'Phase 1 integration: industry context arrives inside the tool analysts already use.' },
        { name: 'img-wf-client-2', note: 'Following an industry driver through to the client it affects.',
          caption: 'The link that makes the industry view worth opening during a client assessment.' }
      ]
    },
    {
      id: 'industry',
      label: 'Explore an industry',
      shots: [
        { name: 'img-wf-industry-1', note: 'The wider industry dashboard: ratings, market information, news, themes.',
          caption: 'Phase 2 — the scope that opened up once we learned there was more to an industry than its drivers.' },
        { name: 'img-wf-industry-2', note: 'A SWOT assessment sitting alongside the drivers.',
          caption: 'One of the four things the research turned up that the original brief had not asked for.' }
      ]
    }
  ];

  /* The toggle panel and its diagrams. */
  CS.DIAGRAMS = [
    {
      id: 'ia',
      label: 'Information architecture',
      name: 'img-ia-structure',
      note: 'How the two levels — industry and client — sit next to each other, and how a reader moves between them.',
      caption: 'The structure that answered three of the open questions at once: what a KID is, how KIDs are organised, and where the two levels meet.'
    },
    {
      id: 'integration',
      label: 'Integration with the client dashboard',
      name: 'img-ia-integration',
      note: 'Where the new industry panel plugs into the existing client dashboard.',
      caption: 'An extension of the architecture that was already there, rather than a second place to go.'
    }
  ];

  /* The people, and the four tiles each of them answers. */
  CS.TILES = ['Their week', 'What they want', 'What gets in the way', 'In their words'];

  CS.PERSONAS = [
    {
      name: 'The credit analyst',
      meta: 'Primary user · assesses client risk daily',
      media: 'img-persona-analyst',
      mediaNote: 'Portrait or working photograph of a credit analyst.',
      panels: [
        'PLACEHOLDER — a week of client assessments, each one needing industry context that currently has to be gathered from several places.',
        'PLACEHOLDER — to see what is moving in an industry without leaving the client they are assessing.',
        'PLACEHOLDER — industry information is scattered, and nothing says which of it is worth acting on.',
        'PLACEHOLDER — a quote from a real analyst goes here.'
      ]
    },
    {
      name: 'The executive director',
      meta: 'Working group · quoted in the testing round',
      media: 'img-persona-director',
      mediaNote: 'Portrait or working photograph of the executive director.',
      panels: [
        'PLACEHOLDER — reviews the analysis rather than producing it, and needs to reach a judgement quickly.',
        'PLACEHOLDER — drivers arranged so the direction of impact is obvious at a glance.',
        'PLACEHOLDER — a flat list of drivers gives no sense of which way the industry is moving.',
        '“Strong preference for seeing drivers separated into positive & negative impacts.”'
      ]
    },
    {
      name: 'The subject matter expert',
      meta: 'Consulted in research · alongside the product managers',
      media: 'img-persona-sme',
      mediaNote: 'Portrait or working photograph of a subject matter expert.',
      panels: [
        'PLACEHOLDER — holds the industry knowledge the dashboard has to encode.',
        'PLACEHOLDER — the reasoning behind a driver to survive the trip into the interface.',
        'PLACEHOLDER — judgement that is hard to reduce to a number or a tile.',
        'PLACEHOLDER — a quote from an SME goes here.'
      ]
    }
  ];

  /* Drawer contents, keyed by the id on whatever opened them. */
  CS.DRAWERS = {
    questions: {
      title: 'How the open questions were answered',
      media: 'img-drawer-questions',
      mediaKind: 'image',
      mediaNote: 'The synthesis wall, or the page of the workbook where these were worked through.',
      caption: 'Diagram: the seven questions and where each one was settled.',
      body: [
        'PLACEHOLDER — this drawer is where the seven open questions get their answers, one short paragraph each.',
        'What a KID is, and how an analyst reads one, came out of the sessions with subject matter experts. How they are organised was settled in testing, by the preference for separating positive from negative impact.',
        'What monitoring means here, how the two levels are separated, how a reader moves between them, and how the insights feed back into client analysis were all settled by the information architecture on the short view of this case study.'
      ]
    },
    scope: {
      title: 'How the scope widened',
      media: 'img-drawer-scope',
      mediaKind: 'image',
      mediaNote: 'The four-step diagram of how the brief grew.',
      caption: 'Diagram: one page became a platform, in four steps.',
      body: [
        'PLACEHOLDER — the fuller version of the chain on the slide.',
        'The brief asked for a page for monitoring key industry drivers. Research showed that analysts also wanted rating trends, market information, news, emerging themes and SWOT assessments — none of which fit on a drivers page.',
        'Rather than refuse the extra scope or absorb it quietly, we put it to stakeholders as a phased product. The wider dashboard needed more time, but it drew more support, and phasing let the first useful thing ship without waiting for it.'
      ]
    }
  };
})(window.CS);
