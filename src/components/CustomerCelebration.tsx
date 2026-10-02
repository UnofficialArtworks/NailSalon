import type { Customer, Wishes } from '../game/types';
import { occasionFor } from '../game/occasions';
import { Portrait } from './Portrait';
import { Icon } from './Icon';

export function CustomerCelebration({
  customer,
  score,
  earned,
}: {
  customer: Customer;
  score: Wishes;
  earned: number;
}) {
  const reasons = [
    'Five polished nails',
    ...(score.color ? ['Favorite color'] : []),
    ...(score.sticker ? ['Favorite sticker'] : []),
  ];
  return (
    <section className="customer-celebration" aria-label="Customer celebration">
      <div className="finished-friend">
        <Portrait customer={customer} happy />
        <div>
          <h3>{customer.name} loves her lovely nails!</h3>
          <p>{occasionFor(customer.id).thanks}</p>
        </div>
      </div>
      <div className="earned-stars" role="status" aria-label={`${earned} stars earned`}>
        {reasons.slice(0, earned).map((reason, i) => (
          <span className="earned-star" key={reason} style={{ animationDelay: `${i * 0.45}s` }}>
            <Icon id="star" size={44} />
            <small>{reason}</small>
          </span>
        ))}
        <strong>+{earned} stars</strong>
      </div>
    </section>
  );
}
