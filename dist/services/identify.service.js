"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyContact = void 0;
const prisma_1 = require("../prisma");
const identifyContact = async (email, phoneNumber) => {
    if (!email && !phoneNumber) {
        throw new Error("Either email or phoneNumber required");
    }
    // 1️⃣ Find all contacts matching email OR phone
    const matched = await prisma_1.prisma.contact.findMany({
        where: {
            OR: [
                email ? { email } : undefined,
                phoneNumber ? { phoneNumber } : undefined,
            ].filter(Boolean),
        },
    });
    // 2️⃣ If no match → create primary
    if (matched.length === 0) {
        const newContact = await prisma_1.prisma.contact.create({
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
    // 3️⃣ Get all related contacts (including linked ones)
    const relatedIds = new Set();
    for (const contact of matched) {
        if (contact.linkPrecedence === "primary") {
            relatedIds.add(contact.id);
        }
        else if (contact.linkedId) {
            relatedIds.add(contact.linkedId);
        }
    }
    const relatedContacts = await prisma_1.prisma.contact.findMany({
        where: {
            OR: [
                { id: { in: Array.from(relatedIds) } },
                { linkedId: { in: Array.from(relatedIds) } },
            ],
        },
    });
    // 4️⃣ Determine oldest primary
    const primaries = relatedContacts.filter((c) => c.linkPrecedence === "primary");
    primaries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const primary = primaries[0];
    // 5️⃣ Merge multiple primaries if needed
    for (let i = 1; i < primaries.length; i++) {
        await prisma_1.prisma.contact.update({
            where: { id: primaries[i].id },
            data: {
                linkPrecedence: "secondary",
                linkedId: primary.id,
            },
        });
    }
    // 6️⃣ Check if new info exists
    const allEmails = relatedContacts.map((c) => c.email);
    const allPhones = relatedContacts.map((c) => c.phoneNumber);
    const emailExists = email && allEmails.includes(email);
    const phoneExists = phoneNumber && allPhones.includes(phoneNumber);
    if ((email && !emailExists) ||
        (phoneNumber && !phoneExists)) {
        await prisma_1.prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkedId: primary.id,
                linkPrecedence: "secondary",
            },
        });
    }
    // 7️⃣ Fetch final consolidated contacts
    const finalContacts = await prisma_1.prisma.contact.findMany({
        where: {
            OR: [
                { id: primary.id },
                { linkedId: primary.id },
            ],
        },
    });
    const primaryContact = finalContacts.find((c) => c.id === primary.id);
    const emails = [
        primaryContact?.email,
        ...finalContacts
            .filter((c) => c.id !== primary.id)
            .map((c) => c.email),
    ].filter(Boolean);
    const phoneNumbers = [
        primaryContact?.phoneNumber,
        ...finalContacts
            .filter((c) => c.id !== primary.id)
            .map((c) => c.phoneNumber),
    ].filter(Boolean);
    const secondaryContactIds = finalContacts
        .filter((c) => c.linkPrecedence === "secondary")
        .map((c) => c.id);
    return {
        primaryContactId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
    };
};
exports.identifyContact = identifyContact;
