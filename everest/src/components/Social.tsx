/* eslint-disable @next/next/no-img-element */
import { SOCIAL } from '@/lib/event';

/**
 * Vista previa de perfiles de Instagram. Instagram no permite incrustar perfiles sin
 * credenciales de su API; la tarjeta muestra identidad verificada y abre el perfil real.
 */
export function SocialCards() {
  return (
    <ul className="rail" aria-label="Perfiles en Instagram">
      {SOCIAL.map((s) => (
        <li key={s.handle} className="ig">
          <a href={s.href} target="_blank" rel="noopener noreferrer" className="ig__link" aria-label={`Abrir @${s.handle} en Instagram`}>
            <div className="ig__cover">
              <img src={s.cover} alt="" loading="lazy" />
              <img className="ig__glyph" src="/contact/instagram.png" alt="" width={30} height={30} />
            </div>
            <div className="ig__body">
              <div className="ig__avatar" aria-hidden="true">
                {s.avatar === 'logo' ? <img src="/brand/somos-logo.svg" alt="" /> : <span>{s.avatar}</span>}
              </div>
              <div className="ig__id">
                <strong>@{s.handle}</strong>
                <span>{s.name}</span>
              </div>
              <p>{s.bio}</p>
              <span className="ig__cta">Ver perfil en Instagram</span>
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
}
