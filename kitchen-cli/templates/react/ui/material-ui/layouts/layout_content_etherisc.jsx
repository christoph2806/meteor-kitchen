import { ThemeProvider, Container, Paper, Divider, Box } from "@material-ui/core";
import styled from "styled-components";
import {theme} from "/imports/modules/both/object_utils";

export function TEMPLATE_NAME(props) {

  React.useEffect(() => {
    /*TEMPLATE_CREATED_CODE*/
    /*TEMPLATE_RENDERED_CODE*/
    Meteor.defer(function () {
      globalOnRendered();
    });

    return () => {
      /*TEMPLATE_DESTROYED_CODE*/
    };
  }, []);

  /*EVENTS_CODE*/

  /*HELPERS_CODE*/

  if (props.data.dataLoading) {
    return <Loading />;
  }
  return (
    <ThemeProvider theme={theme}>

    <StyledContainer maxWidth={false} component="main">
      <StyledHeader> HEADER </StyledHeader>
      <StyledAside>
        <Box
          display="flex"
          flexBasis="150px"
          justifyContent="center"
          alignItems="center"
        >
          <div>LOGO ICON</div>
        </Box>
        <Divider />
        <List id="menu">LEFT SIDE NAVIGATION {/* change this.props into props */}</List>
      </StyledAside>
      <StyledSection>
        <StyledPaper elevation={2}>
          {props.content}
        </StyledPaper>
      </StyledSection>
      <StyledFooter>
        <p>ETHERISC LOGO</p>
      </StyledFooter>
    </StyledContainer>
    </ThemeProvider>

  );
}

const StyledHeader = styled.header`
  grid-area: header;
  background-color: ${theme.palette.primary.main};
`;

const StyledContainer = styled((props) => <Container {...props} />)`
  && {
    display: grid;
    grid-template-columns: 300px 1fr;
    grid-template-rows: 50px 1fr 80px;
    grid-template-areas:
      "aside header"
      "aside content"
      "footer footer";
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    min-height: 100vh;
    padding: 0 8px;
  }
`;

const StyledSection = styled.section`
  grid-area: content;
`;

const StyledPaper = styled((props) => <Paper {...props} />)`
  && {
    min-height: calc(100% - 56px);
    padding: 32px;
  }
`;
// 56px === height + padding of header element

const StyledAside = styled.aside`
  display: flex;
  flex-direction: column;
  grid-area: aside;
  max-height: calc(100vh - 80px);
`;

const StyledFooter = styled.footer`
  grid-area: footer;
  padding: 16px;
  background-color: #607d8b;
  display: flex;
  align-items: center;
`;

export const TEMPLATE_NAMEContainer = withTracker(function (props) {
  /*SUBSCRIPTIONS*/
})(TEMPLATE_NAME);
