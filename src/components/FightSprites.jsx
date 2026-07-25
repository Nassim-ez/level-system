// Kampf-Figuren, 1:1 aus dungeon-mockup.html übernommen (viewBox 0 0 200 200).
// Die Klassen eye/aura/auraring/glowline werden in index.css animiert.

const ART = {
  koloss: `<g fill="#111a28" stroke="#2f4a68" stroke-width="1.5">
 <path d="M62 190 h30 l-3 -46 h-22 z"/><path d="M108 190 h30 l-5 -46 h-22 z"/>
 <path d="M52 84 q48 -16 96 0 l10 62 q-58 14 -116 0 z"/>
 <path d="M46 88 l-16 54 q10 8 20 2 l12 -48 z"/><path d="M154 88 l16 54 q-10 8 -20 2 l-12 -48 z"/>
 <path d="M84 62 q16 -10 32 0 l4 22 q-20 8 -40 0 z"/></g>
 <g class="glowline" stroke="#ff7a4d" stroke-width="2.2" fill="none" opacity=".85">
 <path d="M76 96 l14 22 l-8 18"/><path d="M120 100 l-10 26 l12 14"/><path d="M96 140 l6 20"/></g>
 <g class="eye" fill="#ff8a5c"><circle cx="92" cy="72" r="3.2"/><circle cx="110" cy="72" r="3.2"/></g>`,
  hetzer: `<g fill="#121a26" stroke="#2f4a68" stroke-width="1.5">
 <path d="M96 60 q14 -8 24 4 q4 12 -8 18 l2 12 q18 6 24 22 l14 40 q-6 8 -14 2 l-14 -30 l-10 26 l14 34 q-6 6 -14 0 l-18 -34 l-16 30 q-8 4 -12 -4 l16 -40 l-4 -22 q-16 -6 -18 -20 q10 -8 18 0 z"/></g>
 <g class="glowline" stroke="#ffb84d" stroke-width="2" fill="none" opacity=".8">
 <path d="M104 84 l8 26 l-6 20"/><path d="M88 100 l-10 22"/></g>
 <g class="eye" fill="#ffd166"><circle cx="110" cy="66" r="2.6"/></g>`,
  wolf: `<g fill="#0d1420" stroke="#2b4460" stroke-width="1.4">
 <path d="M46 186 q-6 -34 16 -52 q16 -14 38 -14 q22 0 38 14 q22 18 16 52 q-14 6 -26 2 l-4 -22 l-8 24 q-16 4 -32 0 l-8 -24 l-4 22 q-12 4 -26 -2 z"/>
 <path d="M58 150 l-10 34 q8 8 20 4 l4 -30 z"/>
 <path d="M142 150 l10 34 q-8 8 -20 4 l-4 -30 z"/>
 <path d="M40 184 q10 -6 20 0 l2 8 q-12 4 -22 -2 z"/>
 <path d="M160 184 q-10 -6 -20 0 l-2 8 q12 4 22 -2 z"/>
 <path d="M62 128 l-12 -20 l10 4 l-6 -20 l14 12 l-4 -18 l14 16"/>
 <path d="M138 128 l12 -20 l-10 4 l6 -20 l-14 12 l4 -18 l-14 16"/>
</g>
<g stroke="#8fa8c4" stroke-width="1.6" fill="none" opacity=".85">
 <path d="M42 190 l-4 5"/><path d="M50 192 l-2 6"/><path d="M58 191 l1 6"/>
 <path d="M158 190 l4 5"/><path d="M150 192 l2 6"/><path d="M142 191 l-1 6"/>
</g>
<path d="M 107.8 26.7 L 116.5 37.2 L 129.6 37.0 L 131.8 49.6 L 147.9 52.5 L 137.7 66.5 L 154.9 75.5 L 136.9 83.4 L 144.5 97.1 L 130.8 100.6 L 125.6 110.4 L 113.2 109.0 L 104.9 123.4 L 94.7 106.4 L 79.6 119.5 L 76.2 103.8 L 63.5 102.0 L 62.6 90.8 L 50.8 83.8 L 61.2 73.0 L 48.1 60.7 L 67.1 57.0 L 60.7 40.1 L 77.8 42.5 L 84.0 31.4 L 96.0 34.1 Z" fill="#101a28" stroke="#2f4d6e" stroke-width="1.4"/>
<path d="M 120.1 42.1 L 125.3 52.8 L 135.4 58.2 L 133.4 69.3 L 142.9 78.8 L 129.8 86.2 L 135.5 100.5 L 118.9 99.3 L 114.4 111.6 L 102.5 108.0 L 91.9 110.2 L 84.1 102.8 L 69.2 104.3 L 74.2 88.9 L 57.8 84.4 L 67.0 73.8 L 64.0 63.7 L 72.5 57.1 L 75.6 46.0 L 88.8 48.4 L 96.9 36.1 L 106.6 48.0 Z" fill="#0a121d" stroke="#274058" stroke-width="1"/>
<g fill="#0d1420" stroke="#2f4d6e" stroke-width="1.4">
 <path d="M70 44 l-4 -26 l22 16 z"/>
 <path d="M130 44 l4 -26 l-22 16 z"/>
</g>
<g fill="#0f1826" stroke="#3a5f82" stroke-width="1.3">
 <path d="M78 62 q22 -12 44 0 l-4 30 q-4 10 -18 10 q-14 0 -18 -10 z"/>
 <path d="M88 96 q12 -6 24 0 l-3 16 q-9 5 -18 0 z"/>
</g>
<path d="M88 108 q12 8 24 0 l-4 18 q-8 6 -16 0 z" fill="#1c0a10" stroke="#4a2030" stroke-width="1"/>
<g fill="#dfeaf5">
 <path d="M91 110 l3 7 l3 -7 z"/><path d="M99 111 l3 8 l3 -8 z"/><path d="M107 110 l3 7 l2.5 -7 z"/>
 <path d="M93 126 l3 -7 l3 7 z"/><path d="M102 127 l3 -8 l3 8 z"/>
</g>
<path d="M96 98 q4 -3 8 0 q-4 4 -8 0 z" fill="#25313f"/>
<g class="eye">
 <path d="M82 76 l13 5 l-13 4 z" fill="#ff5a3c"/>
 <path d="M118 76 l-13 5 l13 4 z" fill="#ff5a3c"/>
 <circle cx="88" cy="81" r="6" fill="#ff5a3c" opacity=".28"/>
 <circle cx="112" cy="81" r="6" fill="#ff5a3c" opacity=".28"/>
</g>
<g class="glowline" stroke="#7f6bff" stroke-width="1.6" fill="none" opacity=".6">
 <path d="M74 132 q26 -10 52 0"/><path d="M80 148 q20 -8 40 0"/>
</g>`,
  frost: `<g fill="#101b28" stroke="#3a6182" stroke-width="1.5">
 <path d="M100 44 q16 0 18 18 q0 14 -10 20 l4 16 q20 8 22 30 l6 54 q-8 8 -16 0 l-6 -44 l-6 50 q-8 6 -14 0 l-2 -50 l-8 44 q-8 8 -16 0 l6 -54 q2 -22 22 -30 l4 -16 q-10 -6 -10 -20 q2 -18 18 -18 z"/></g>
 <g stroke="#7fe6ff" stroke-width="2" fill="#0d2a3a" opacity=".9">
 <path d="M78 96 l-22 -16 l8 22 z"/><path d="M122 96 l24 -14 l-10 22 z"/><path d="M100 150 l-16 26 l32 0 z"/></g>
 <g class="eye" fill="#9ff0ff"><circle cx="93" cy="58" r="2.8"/><circle cx="107" cy="58" r="2.8"/></g>`,
  nacht: `<g class="aura" stroke="#5a2a3a" stroke-width="1" fill="none" opacity=".8">
 <circle cx="100" cy="110" r="76" stroke-dasharray="6 12"/><circle cx="100" cy="110" r="60" stroke-dasharray="18 14"/></g>
 <g fill="#0b1018" stroke="#5c2333" stroke-width="1.6">
 <path d="M100 26 q30 4 34 40 l8 100 q-42 14 -84 0 l8 -100 q4 -36 34 -40 z"/>
 <path d="M66 76 l-26 66 q8 10 18 4 l16 -50 z"/><path d="M134 76 l26 66 q-8 10 -18 4 l-16 -50 z"/>
 <path d="M100 30 q18 2 22 24 q-22 12 -44 0 q4 -22 22 -24 z"/></g>
 <g stroke="#ff4d5e" stroke-width="2" fill="none" class="glowline" opacity=".9">
 <path d="M84 20 l4 -14 l6 12 l6 -18 l6 18 l6 -12 l4 14"/></g>
 <g class="glowline" stroke="#ff4d5e" stroke-width="1.6" fill="none" opacity=".7">
 <path d="M78 96 q22 10 44 0"/><path d="M76 122 q24 12 48 0"/></g>
 <g class="eye" fill="#ff5f6f"><circle cx="91" cy="52" r="3.6"/><circle cx="109" cy="52" r="3.6"/></g>`,
  player: `<g class="auraring" stroke="#3fb6ff" stroke-width="1" fill="none" opacity=".55">
 <circle cx="100" cy="118" r="70" stroke-dasharray="5 11"/><circle cx="100" cy="118" r="56" stroke-dasharray="16 12"/></g>
<g fill="#0e1a2a" stroke="#4a9fd8" stroke-width="1.6">
 <circle cx="100" cy="42" r="14"/>
 <path d="M100 56 q20 4 24 24 l4 44 q-28 8 -56 0 l4 -44 q4 -20 24 -24 z"/>
 <path d="M78 84 l-20 40 q6 8 14 4 l14 -32 z"/>
 <path d="M122 84 l24 34 q-4 10 -14 6 l-16 -28 z"/>
 <path d="M88 124 l-6 60 q8 6 16 2 l4 -50 z"/>
 <path d="M112 124 l8 60 q-8 6 -16 2 l-4 -50 z"/>
 <ellipse cx="86" cy="188" rx="11" ry="5"/><ellipse cx="116" cy="188" rx="11" ry="5"/></g>
<g class="glowline" stroke="#8fe0ff" stroke-width="1.8" fill="none" opacity=".8">
 <path d="M86 68 q14 -6 28 0"/><path d="M100 78 v34"/><path d="M90 96 h20"/></g>
<g class="eye" fill="#9fe6ff"><circle cx="94" cy="40" r="2.6"/><circle cx="106" cy="40" r="2.6"/></g>`,
  kobold: `<g fill="#101c18" stroke="#3d7a52" stroke-width="1.5">
 <path d="M100 60 q16 0 18 16 q0 12 -10 16 l2 10 q16 6 18 22 l4 38 q-30 8 -64 0 l4 -38 q2 -16 18 -22 l2 -10 q-10 -4 -10 -16 q2 -16 18 -16 z"/>
 <path d="M82 66 l-20 -12 l14 22 z"/><path d="M118 66 l20 -12 l-14 22 z"/>
 <path d="M84 162 l-6 26 q8 6 14 2 l2 -24 z"/><path d="M116 162 l6 26 q-8 6 -14 2 l-2 -24 z"/></g>
<g fill="#dfeaf5"><path d="M94 88 l3 6 l3 -6 z"/><path d="M104 88 l3 6 l2 -6 z"/></g>
<g class="eye" fill="#8dff9f"><circle cx="93" cy="72" r="2.6"/><circle cx="107" cy="72" r="2.6"/></g>`,
  skelett: `<g fill="none" stroke="#c4d6e8" stroke-width="2.2" stroke-linecap="round">
 <ellipse cx="100" cy="46" rx="15" ry="17"/>
 <path d="M92 58 q8 6 16 0"/>
 <line x1="100" y1="64" x2="100" y2="128" stroke-dasharray="5 4"/>
 <path d="M78 76 q22 -8 44 0"/>
 <path d="M84 90 q16 8 32 0"/><path d="M84 104 q16 8 32 0"/><path d="M86 118 q14 7 28 0"/>
 <path d="M78 78 L54 112 L44 142"/><path d="M122 78 L146 112 L156 142"/>
 <path d="M84 128 q16 12 32 0"/>
 <path d="M90 136 L82 178 L76 196"/><path d="M110 136 L118 178 L124 196"/></g>
<g class="eye" fill="#6df0ff"><circle cx="93" cy="44" r="3.4"/><circle cx="107" cy="44" r="3.4"/></g>`,
  schatten: `<g class="auraring" stroke="#6b4bd6" stroke-width="1" fill="none" opacity=".5">
 <circle cx="100" cy="110" r="66" stroke-dasharray="4 14"/></g>
<g fill="#0d0a1a" stroke="#5a3fb0" stroke-width="1.5">
 <path d="M100 32 q26 6 28 36 l6 60 q-6 22 -34 24 q-28 -2 -34 -24 l6 -60 q2 -30 28 -36 z"/>
 <path d="M72 84 l-26 42 q6 10 16 4 l16 -30 z"/>
 <path d="M128 84 l26 42 q-6 10 -16 4 l-16 -30 z"/>
 <path d="M70 152 q30 16 60 0 l-6 30 q-24 10 -48 0 z"/></g>
<g class="glowline" stroke="#8f6bff" stroke-width="1.6" fill="none" opacity=".7">
 <path d="M78 100 q22 10 44 0"/><path d="M80 124 q20 10 40 0"/></g>
<g class="eye" fill="#b79bff"><circle cx="92" cy="58" r="3.4"/><circle cx="108" cy="58" r="3.4"/></g>`,
  vogt: `<g fill="none" stroke="#d6c2a0" stroke-width="2.4" stroke-linecap="round">
 <ellipse cx="100" cy="44" rx="17" ry="19"/>
 <path d="M100 62 v70" stroke-dasharray="6 4"/>
 <path d="M74 74 q26 -10 52 0"/>
 <path d="M80 90 q20 10 40 0"/><path d="M80 106 q20 10 40 0"/><path d="M82 122 q18 9 36 0"/>
 <path d="M74 76 L46 114 L34 148"/><path d="M126 76 L154 114 L166 148"/>
 <path d="M80 132 q20 14 40 0"/>
 <path d="M88 140 L78 182 L70 198"/><path d="M112 140 L122 182 L130 198"/></g>
<g fill="#1a1220" stroke="#8a6bd6" stroke-width="1.6">
 <path d="M82 26 l6 -14 l6 12 l6 -18 l6 18 l6 -12 l6 14 q-18 8 -36 0 z"/></g>
<g class="glowline" stroke="#9b6bff" stroke-width="1.8" fill="none" opacity=".75">
 <path d="M34 148 l-10 22"/><path d="M166 148 l10 22"/></g>
<g class="eye" fill="#c48dff"><circle cx="92" cy="42" r="4"/><circle cx="108" cy="42" r="4"/></g>`,
}

export default function FightSprite({ name, id, className = '', style }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={{ overflow: 'visible', ...style }}
    >
      <g id={id} dangerouslySetInnerHTML={{ __html: ART[name] ?? ART.kobold }} />
    </svg>
  )
}

export { ART }
