export enum ColourName {
  red = "red",
  orange = "orange",
  yellow = "yellow",
  lime = "lime",
  green = "green",
  blue = "blue",
  cyan = "cyan",
  pink = "pink",
  purple = "purple",
  brown = "brown",
  grey = "grey",
}

export type Colour = {
  name: ColourName;
  text: string;
  background: string;
  border: string;
  primary: {
    text: string;
    textHovered: string;
    background: string;
    backgroundHovered: string;
  };
  secondary: {
    textHovered: string;
    background: string;
    backgroundHovered: string;
    border: string;
  };
};
