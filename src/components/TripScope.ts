import { createContext, useContext } from 'react';

/** The trip currently on screen. Documents are cached per trip, and the rows that
 *  render them sit several levels below the library, so the id arrives by context
 *  rather than through every card in between. */
export const TripScopeContext = createContext<string | null>(null);

export const useTripId = (): string | null => useContext(TripScopeContext);
