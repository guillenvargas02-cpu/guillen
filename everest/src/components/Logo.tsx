/* eslint-disable @next/next/no-img-element */
// Logotipo oficial SOMOS (vector del Manual de Identidad 2026). Nunca se recompone con fuentes.
// - "positivo": rosa sobre blanco (uso oficial).
// - "pleca": sobre fotografía o color, con la pleca blanca oficial.
// El área de seguridad se aplica como margen proporcional al ancho.
export function SomosLogo({ variant = 'positivo', width = 120, className }: { variant?: 'positivo' | 'pleca'; width?: number; className?: string }) {
  const src = variant === 'pleca' ? '/brand/somos-pleca.svg' : '/brand/somos-logo.svg';
  const ratio = variant === 'pleca' ? 568.79 / 157.36 : 900.9 / 154.14;
  return (
    <img
      src={src}
      alt="SOMOS"
      width={width}
      height={Math.round(width / ratio)}
      className={className}
      style={{ width, height: 'auto', margin: variant === 'positivo' ? `${Math.round(width * 0.06)}px 0` : undefined }}
      draggable={false}
    />
  );
}
