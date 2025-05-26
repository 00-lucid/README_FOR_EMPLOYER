import {
  Block,
  BlockTitle,
  Button,
  Col,
  Link,
  List,
  ListItem,
  Navbar,
  NavLeft,
  NavRight,
  NavTitle,
  Page,
  Row,
  Searchbar,
  Card,
  Fab,
  FabButton,
  FabButtons,
  Icon,
  TextEditor,
  Segmented,
  Gauge,
} from "framework7-react";
import React from "react";
import "../css/app.less";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  basketState,
  contactsState,
  isContactState,
  selectContactsState,
  isPopWriteState,
  reviewGaugeState,
  textState,
} from "../recoil/state";
import axios from "axios";
import { getToken } from "../common/auth";
import ContactItem from "../components/ContactItem";
import AddReview from "../components/AddReview";
import helper from "./modules/helper";

const ContactsPage = () => {
  const [text, handleText] = useRecoilState(textState);
  const [contacts, handleContacts] = useRecoilState(contactsState);
  const [isContact, handleIsContact] = useRecoilState(isContactState);
  const [isPopWrite, handleIsPopWrite] = useRecoilState(isPopWriteState);
  const [reviewGauge, handleReviewGauge] = useRecoilState(reviewGaugeState);
  const [selectContacts, handleSelectContacts] = useRecoilState(
    selectContactsState
  );

  return (
    <Page name="basket">
      <Navbar sliding={false}>
        <NavTitle title="주문내역"></NavTitle>
      </Navbar>
      <List
        style={{
          backgroundColor: "#5383E8",
        }}
      >
        <ul>
          {contacts.length > 0 && isContact && !isPopWrite
            ? contacts.map((contact, idx) => {
                return (
                  <ContactItem
                    key={contact.id}
                    idx={contact.id}
                    contact={contact}
                    select={false}
                  />
                );
              })
            : !isPopWrite
            ? contacts.map((contact, idx) => {
                return (
                  <ContactItem
                    key={contact.id}
                    idx={contact.id}
                    contact={contact}
                    select={true}
                  />
                );
              })
            : null}
        </ul>
      </List>
    </Page>
  );
};
export default ContactsPage;
