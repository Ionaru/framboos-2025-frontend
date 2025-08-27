import { GraphNodeStyle } from '../utils/types';

export enum LocationType {
  NORMAL,
  PLAYER,
  DATA,
  TRAP,
}

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
  // shadowBlur: 0,
};

export const dataLocationStyle: GraphNodeStyle = {
  ...standardLocationStyle,
  shadowColor: '#00f000',
  borderColor: '#69a4e5',
};

export const trapLocationStyle: GraphNodeStyle = {
  ...standardLocationStyle,
  shadowColor: '#f00000',
  borderColor: '#6366f1',
};

export const locationStyles = new Map<LocationType, GraphNodeStyle>([
  [LocationType.NORMAL, standardLocationStyle],
  [LocationType.PLAYER, playerLocationStyle],
  [LocationType.DATA, dataLocationStyle],
  [LocationType.TRAP, trapLocationStyle],
]);
