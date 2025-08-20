import { GraphNodeStyle } from '../utils/types';

export enum LocationType {
  NORMAL,
  PLAYER,
  DATA,
  TRAP,
}

export const getLocationType = (isOnLocation: boolean): LocationType => {
  if (Math.random() > 0.99) {
    return LocationType.DATA;
  }

  if (Math.random() > 0.99) {
    return LocationType.TRAP;
  }

  if (isOnLocation) {
    return LocationType.PLAYER;
  }

  return LocationType.NORMAL;
};

export const standardLocationStyle: GraphNodeStyle = {
  color: '#121212',
  shadowBlur: 15,
  shadowColor: '#69a4e5',
  borderColor: '#121212',
  borderWidth: 2,
  borderType: 'solid',
};

export const playerLocationStyle: GraphNodeStyle = {
  ...standardLocationStyle,
  borderColor: '#69a4e5',
};

export const dataLocationStyle: GraphNodeStyle = {
  ...standardLocationStyle,
  shadowColor: '#00FF00',
  borderColor: '#00FF00',
};

export const trapLocationStyle: GraphNodeStyle = {
  ...standardLocationStyle,
  shadowColor: '#FF0000',
  borderWidth: 1,
};

export const locationStyles = new Map<LocationType, GraphNodeStyle>([
  [LocationType.NORMAL, standardLocationStyle],
  [LocationType.PLAYER, playerLocationStyle],
  [LocationType.DATA, dataLocationStyle],
  [LocationType.TRAP, trapLocationStyle],
]);
