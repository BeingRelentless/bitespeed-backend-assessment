import { prisma } from "../prisma";

export const identifyContact = async (
  email?: string,
  phoneNumber?: string
) => {
  const matchedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        email ? { email } : undefined,
        phoneNumber ? { phoneNumber } : undefined,
      ].filter(Boolean) as any,
    },
  });

  if (matchedContacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "primary",
      },
    });

    return {
      primaryContactId: newContact.id,
      emails: email ? [email] : [],
      phoneNumbers: phoneNumber ? [phoneNumber] : [],
      secondaryContactIds: [],
    };
  }

  const primaryContact = matchedContacts.find(
    (c) => c.linkPrecedence === "primary"
  );

  if (!primaryContact) throw new Error("Primary contact not found");

  const allContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryContact.id },
        { linkedId: primaryContact.id },
      ],
    },
  });

  const emails = [
    ...new Set(allContacts.map((c) => c.email).filter(Boolean)),
  ] as string[];

  const phoneNumbers = [
    ...new Set(allContacts.map((c) => c.phoneNumber).filter(Boolean)),
  ] as string[];

  const secondaryContactIds = allContacts
    .filter((c) => c.linkPrecedence === "secondary")
    .map((c) => c.id);

  return {
    primaryContactId: primaryContact.id,
    emails,
    phoneNumbers,
    secondaryContactIds,
  };
};