import React, { useId } from 'react';

/**
 * Reusable Animated Empathy SVG for Sprout-Bot (AURA-7 v2.3).
 * Supports four inference-driven emotional & medical expressions:
 * - alert_protector: serious brows, glowing #00F0FF cyan eyes & holographic energy shield
 * - worried_empathetic: downward-tilted sympathetic brows & warm amber #FFB800 light
 * - medical_assistant: medical headband + sweeping animated laser scan beam (+ ARED weights if missed)
 * - optimal_motivated: bright radiant eyes, cheerful smile & thriving Mizuna sprout
 */
export default function SproutBotAvatarSvg({
  visualExpression = 'optimal_motivated',
  mascotPosture = 'nominal',
  circadianMode = 'day',
  earthCommDelayMin = 2.6,
  overallStatus = 'optimal',
  isDark = false,
  className = 'w-60 h-60 sm:w-64 sm:h-64',
  compact = false,
}) {
  const uid = useId().replace(/:/g, '');
  const auraId = `sprout-aura-${uid}`;
  const shellId = `sprout-shell-${uid}`;
  const visorClipId = `sprout-visor-${uid}`;

  const isNight = circadianMode === 'night';
  const isSunset = circadianMode === 'sunset';

  const coreColor =
    visualExpression === 'alert_protector'
      ? '#00F0FF'
      : visualExpression === 'worried_empathetic'
      ? '#FFB800'
      : visualExpression === 'medical_assistant'
      ? '#00F0FF'
      : isNight
      ? '#6366f1'
      : isSunset
      ? '#f59e0b'
      : '#00FF66';

  const visorBg =
    visualExpression === 'alert_protector'
      ? '#061a24'
      : visualExpression === 'worried_empathetic'
      ? '#211406'
      : visualExpression === 'medical_assistant'
      ? '#071b26'
      : isNight
      ? '#090e23'
      : isSunset
      ? '#261206'
      : '#082f49';

  const eyeColor =
    visualExpression === 'alert_protector'
      ? '#00F0FF'
      : visualExpression === 'worried_empathetic'
      ? '#FFB800'
      : visualExpression === 'medical_assistant'
      ? '#00FF66'
      : isNight
      ? '#818cf8'
      : isSunset
      ? '#fbbf24'
      : '#00FF66';

  const leafColor =
    visualExpression === 'alert_protector'
      ? '#67e8f9'
      : visualExpression === 'worried_empathetic'
      ? '#fbbf24'
      : isSunset
      ? '#84cc16'
      : '#22c55e';

  const showShield = visualExpression === 'alert_protector' || mascotPosture === 'shield';
  const showWeights = !compact && mascotPosture === 'weights';
  const showVeggieProp =
    !compact && mascotPosture === 'veggie' && visualExpression !== 'worried_empathetic';
  const isSleepingNight = isNight && visualExpression === 'optimal_motivated' && mascotPosture === 'nominal';

  return (
    <svg
      viewBox="0 0 280 280"
      className={`${className} drop-shadow-xl select-none`}
      role="img"
      aria-label={`Sprout-Bot (${visualExpression})`}
    >
      <defs>
        <radialGradient id={auraId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={coreColor} stopOpacity="0.34" />
          <stop offset="100%" stopColor={coreColor} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={shellId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={isDark ? '#e2e8f0' : '#ffffff'} />
          <stop offset="100%" stopColor={isDark ? '#94a3b8' : '#cbd5e1'} />
        </linearGradient>
        <clipPath id={visorClipId}>
          <rect x="96" y="96" width="88" height="56" rx="22" />
        </clipPath>
      </defs>

      <circle cx="140" cy="140" r="126" fill={`url(#${auraId})`} />

      {/* Outer Earth Telemetry Comm Latency Ring */}
      <circle
        cx="140"
        cy="140"
        r="120"
        fill="none"
        stroke={coreColor}
        strokeOpacity="0.22"
        strokeWidth="2"
        strokeDasharray="6 6"
      />
      <circle
        cx="140"
        cy="140"
        r="120"
        fill="none"
        stroke={coreColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={2 * Math.PI * 120}
        strokeDashoffset={
          2 * Math.PI * 120 * (1 - Math.min(1, earthCommDelayMin / 20))
        }
        transform="rotate(-90 140 140)"
      />

      {/* Celestial Circadian Marker */}
      {!compact && circadianMode === 'day' && (
        <circle cx="222" cy="46" r="13" fill="#facc15" opacity="0.9" />
      )}
      {!compact && circadianMode === 'sunset' && (
        <circle cx="222" cy="48" r="13" fill="#fb923c" opacity="0.9" />
      )}
      {!compact && circadianMode === 'night' && (
        <path
          d="M 224 36 A 11 11 0 1 0 234 54 A 8 8 0 1 1 224 36 Z"
          fill="#c7d2fe"
        />
      )}

      {/* 1) Alerta / Protector: Holographic Energy Shield */}
      {showShield && (
        <g className="animate-pulse">
          <polygon
            points="140,22 238,78 238,198 140,254 42,198 42,78"
            fill="rgba(0, 240, 255, 0.12)"
            stroke="#00F0FF"
            strokeWidth="3.2"
            strokeDasharray="10 5"
          />
          <polygon
            points="140,36 226,86 226,190 140,240 54,190 54,86"
            fill="none"
            stroke="#67e8f9"
            strokeWidth="1.6"
            opacity="0.75"
          />
        </g>
      )}

      {/* 2) Worried / Empathetic: Warm Amber Soft Resonance Halo */}
      {visualExpression === 'worried_empathetic' && (
        <g className="animate-pulse">
          <circle
            cx="140"
            cy="132"
            r="96"
            fill="rgba(255, 184, 0, 0.09)"
            stroke="#FFB800"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeDasharray="4 8"
          />
        </g>
      )}

      <g className="animate-float-slow">
        {/* Top Sprout Leaf */}
        <path
          d="M 140 82 V 50"
          stroke={visualExpression === 'worried_empathetic' ? '#d97706' : '#16a34a'}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M 140 54 Q 120 34 114 48 Q 112 62 140 60 Z" fill={leafColor} />
        <path d="M 140 54 Q 164 32 168 46 Q 168 62 140 60 Z" fill={leafColor} opacity="0.9" />

        {/* Ears / Acoustic Transceivers */}
        <rect x="74" y="114" width="12" height="32" rx="6" fill={coreColor} />
        <rect x="194" y="114" width="12" height="32" rx="6" fill={coreColor} />

        {/* Head Shell */}
        <rect
          x="84"
          y="82"
          width="112"
          height="88"
          rx="36"
          fill={`url(#${shellId})`}
          stroke={coreColor}
          strokeWidth="3"
        />

        {/* 3) Medical Assistant Headband */}
        {visualExpression === 'medical_assistant' && (
          <g>
            <path
              d="M 90 98 Q 140 86 190 98 L 190 107 Q 140 95 90 107 Z"
              fill="#f8fafc"
              stroke="#00F0FF"
              strokeWidth="1.8"
            />
            <circle cx="140" cy="96" r="10" fill="#0f172a" stroke="#00F0FF" strokeWidth="1.8" />
            <path d="M 140 91 V 101 M 135 96 H 145" stroke="#00FF66" strokeWidth="2.6" strokeLinecap="round" />
          </g>
        )}

        {/* Visor Screen */}
        <rect
          x="96"
          y="96"
          width="88"
          height="56"
          rx="22"
          fill={visorBg}
          stroke={coreColor}
          strokeOpacity="0.65"
          strokeWidth="1.8"
        />

        {/* Facial Expressions inside Visor */}
        {visualExpression === 'alert_protector' ? (
          <g>
            {/* Serious Cyan Glowing Eyes + Shield Determination */}
            <path d="M 108 113 L 129 120 L 111 126 Z" fill="#00F0FF" />
            <path d="M 172 113 L 151 120 L 169 126 Z" fill="#00F0FF" />
            <circle cx="118" cy="119" r="2.2" fill="#ffffff" />
            <circle cx="162" cy="119" r="2.2" fill="#ffffff" />
            <line x1="128" y1="138" x2="152" y2="138" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
          </g>
        ) : visualExpression === 'worried_empathetic' ? (
          <g>
            {/* Tilted Empathetic Amber Eyes + Comforting Expression */}
            <path d="M 109 115 Q 119 109 128 115" stroke="#FFB800" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M 152 115 Q 161 109 171 115" stroke="#FFB800" strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <ellipse cx="119" cy="123" rx="7.5" ry="6.2" transform="rotate(-10 119 123)" fill="#FFB800" />
            <ellipse cx="161" cy="123" rx="7.5" ry="6.2" transform="rotate(10 161 123)" fill="#FFB800" />
            <circle cx="117" cy="121" r="2.3" fill="#ffffff" />
            <circle cx="159" cy="121" r="2.3" fill="#ffffff" />
            {/* Caring soft mouth */}
            <path d="M 131 138 Q 140 133 149 138" stroke="#fcd34d" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          </g>
        ) : visualExpression === 'medical_assistant' ? (
          <g>
            {/* Focused Medical Scanner Eyes + Sweeping Laser Beam */}
            <circle cx="120" cy="121" r="7.5" fill="#00FF66" />
            <circle cx="160" cy="121" r="7.5" fill="#00FF66" />
            <circle cx="122" cy="118" r="2.4" fill="#ffffff" />
            <circle cx="162" cy="118" r="2.4" fill="#ffffff" />
            <path d="M 131 136 Q 140 142 149 136" stroke="#67e8f9" strokeWidth="2.8" fill="none" strokeLinecap="round" />
            <g clipPath={`url(#${visorClipId})`}>
              <g className="animate-visor-laser">
                <rect x="96" y="102" width="88" height="3" fill="#00F0FF" opacity="0.9" />
                <rect x="96" y="99" width="88" height="9" fill="#00F0FF" opacity="0.18" />
              </g>
            </g>
          </g>
        ) : isSleepingNight ? (
          <g>
            <path d="M 112 122 Q 120 128 128 122" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 152 122 Q 160 128 168 122" stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 134 136 Q 140 140 146 136" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <text x="184" y="86" fill="#a5b4fc" fontSize="14" fontWeight="bold" className="animate-zzz-float">
              Zzz
            </text>
          </g>
        ) : (
          <g>
            {/* Optimal Motivated: Bright Radiant Eyes & Cheerful Smile */}
            <circle cx="120" cy="120" r="8" fill={eyeColor} />
            <circle cx="160" cy="120" r="8" fill={eyeColor} />
            <circle cx="123" cy="117" r="2.6" fill="#ffffff" />
            <circle cx="163" cy="117" r="2.6" fill="#ffffff" />
            <path d="M 130 134 Q 140 144 150 134" stroke={eyeColor} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* Body */}
        <rect
          x="104"
          y="172"
          width="72"
          height="48"
          rx="20"
          fill={`url(#${shellId})`}
          stroke={coreColor}
          strokeWidth="2.5"
        />
        <circle cx="140" cy="196" r="12" fill={visorBg} />
        <path
          d="M 140 189 V 203 M 133 196 H 147"
          stroke={overallStatus === 'critical' ? '#FF3366' : visualExpression === 'worried_empathetic' ? '#FFB800' : '#00FF66'}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Contextual Arms / Props */}
        {showWeights ? (
          <g>
            <path d="M 104 186 Q 76 184 74 164" stroke={coreColor} strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M 176 186 Q 204 184 206 164" stroke={coreColor} strokeWidth="7" strokeLinecap="round" fill="none" />
            <line x1="46" y1="162" x2="234" y2="162" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
            <rect x="44" y="146" width="12" height="32" rx="4" fill="#f59e0b" />
            <rect x="58" y="150" width="8" height="24" rx="3" fill="#fbbf24" />
            <rect x="224" y="146" width="12" height="32" rx="4" fill="#f59e0b" />
            <rect x="214" y="150" width="8" height="24" rx="3" fill="#fbbf24" />
          </g>
        ) : showVeggieProp ? (
          <g>
            <path d="M 104 188 Q 84 202 108 214" stroke={coreColor} strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M 176 188 Q 196 202 172 214" stroke={coreColor} strokeWidth="6" strokeLinecap="round" fill="none" />
            <rect x="182" y="196" width="48" height="32" rx="6" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
            <line x1="188" y1="186" x2="224" y2="186" stroke="#f472b6" strokeWidth="3" strokeLinecap="round" />
            <path d="M 198 196 Q 190 178 184 184 Q 186 194 198 196 Z" fill="#4ade80" />
            <path d="M 206 196 Q 206 172 212 178 Q 214 190 206 196 Z" fill="#22c55e" />
            <path d="M 214 196 Q 224 180 226 186 Q 222 195 214 196 Z" fill="#86efac" />
          </g>
        ) : (
          <g>
            <path d="M 104 186 Q 82 196 86 212" stroke={coreColor} strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M 176 186 Q 198 196 194 212" stroke={coreColor} strokeWidth="7" strokeLinecap="round" fill="none" />
          </g>
        )}
      </g>
    </svg>
  );
}
