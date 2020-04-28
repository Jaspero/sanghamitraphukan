import {animate, state, style, transition, trigger} from '@angular/animations';

export const CART_TOGGLE_ANIMATIONS = [
  trigger('openClose', [
    state(
      'open',
      style({
        display: 'block',
        transform: 'scale(1)',
        opacity: 1
      })
    ),
    state(
      'closed',
      style({
        display: 'none',
        userSelect: 'none',
        transform: 'scale(.4)',
        opacity: 0
      })
    ),
    transition('open => closed', [animate('.2s')]),
    transition('closed => open', [animate('.2s')])
  ])
];
