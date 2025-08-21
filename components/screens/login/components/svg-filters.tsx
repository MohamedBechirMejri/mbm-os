export default function SVGFilters() {
  return (
    <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false">
      <defs>
        {/* Edge specular highlight */}
        <filter id="liquidGlassSpec">
          <feGaussianBlur
            in="SourceAlpha"
            stdDeviation="0.8"
            result="alphaBlur"
          />
          <feSpecularLighting
            in="alphaBlur"
            surfaceScale="2.2"
            specularConstant="0.55"
            specularExponent="18"
            lightingColor="#ffffff"
            result="spec"
          >
            <fePointLight x="-2200" y="-1400" z="5000" />
          </feSpecularLighting>
          <feComposite
            in="spec"
            in2="SourceAlpha"
            operator="in"
            result="specOn"
          />
          <feMerge>
            <feMergeNode in="specOn" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle displacement to simulate refraction */}
        <filter
          id="liquidGlassDisplace"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.012"
            numOctaves="2"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="4"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
