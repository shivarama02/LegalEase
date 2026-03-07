from django.core.management.base import BaseCommand
from django.utils.text import slugify
from legal_app.models import LawDomain, LawCategory, Law, LawSection, LawSectionDetail

# ─── DOMAINS & CATEGORIES ────────────────────────────────────
DOMAIN_CATEGORIES = [
    {
        'domain_name': 'Criminal & Penal Law',
        'description': 'Laws related to crimes, punishments, and criminal procedures.',
        'display_order': 1,
        'categories': [
            {'category_name': 'Criminal Law', 'slug': 'ipc', 'description': 'Laws dealing with crimes and punishment.'},
        ],
    },
    {
        'domain_name': 'Civil & Procedural Law',
        'description': 'Laws governing private disputes, contracts, torts, and civil procedures.',
        'display_order': 2,
        'categories': [
            {'category_name': 'Civil Law', 'slug': 'civil', 'description': 'Private disputes between individuals or organizations.'},
        ],
    },
    {
        'domain_name': 'Family & Personal Law',
        'description': 'Laws governing family relationships, marriage, divorce, adoption, and succession.',
        'display_order': 3,
        'categories': [
            {'category_name': 'Family Law', 'slug': 'family', 'description': 'Legal matters involving family relationships.'},
        ],
    },
    {
        'domain_name': 'Employment & Labour Law',
        'description': 'Laws governing workplace relationships, wages, safety, and industrial disputes.',
        'display_order': 4,
        'categories': [
            {'category_name': 'Employment Law', 'slug': 'labour', 'description': 'Rights and obligations in workplace relationships.'},
        ],
    },
    {
        'domain_name': 'Property & Land Law',
        'description': 'Laws related to property ownership, transfer, land acquisition, and real estate.',
        'display_order': 5,
        'categories': [
            {'category_name': 'Property Law', 'slug': 'property', 'description': 'Ownership and use of real estate and personal property.'},
        ],
    },
    {
        'domain_name': 'Consumer & Trade Law',
        'description': 'Laws protecting consumer rights and regulating trade practices.',
        'display_order': 6,
        'categories': [
            {'category_name': 'Consumer Law', 'slug': 'consumer', 'description': 'Protection of consumer rights and fair trade practices.'},
        ],
    },
    {
        'domain_name': 'Cyber & Digital Law',
        'description': 'Laws governing cyberspace, digital transactions, and online offenses.',
        'display_order': 7,
        'categories': [
            {'category_name': 'Cyber Crime', 'slug': 'cyber', 'description': 'Online fraud, hacking, phishing & identity theft.'},
        ],
    },
]

ITEMS_BY_SLUG = {}
DEFAULT_PENALTIES = {
    'ipc': 'Penalties vary per section (imprisonment and/or fine) as specified in the IPC/BNS.',
    'cyber': 'Penalties vary by section of the IT Act and related rules; may include imprisonment and fines.',
    'consumer': 'Includes fines, imprisonment for spurious/adulterated goods, and compensation orders.',
    'labour': 'Non-compliance attracts fines and/or imprisonment depending on the specific statute.',
    'property': 'Primarily civil remedies; criminal penalties may apply via IPC for fraud/forgery.',
    'family': 'Primarily civil decrees; criminal liability may arise via IPC (e.g., bigamy, dowry).',
    'civil': 'No direct criminal penalties; provides civil procedures/remedies.',
}

# ------------------ CRIMINAL LAW ------------------
CRIMINAL_ITEMS = [
    ("Indian Penal Code, 1860 (IPC)", "The primary substantive criminal law of India. Defines crimes (murder, theft, assault, etc.) and prescribes punishments.",
     "Comprehensive code covering offenses against the state, public tranquility, human body, property, and documents.",
     "Examples: Sec 299–304 (Culpable homicide/Murder), Sec 378–382 (Theft/Robbery), Sec 375–376 (Rape)",
     "Penalties vary per section: e.g., Sec 302 (Murder): death or life imprisonment and fine; Sec 379 (Theft): up to 3 years or fine or both"),
    ("Code of Criminal Procedure, 1973 (CrPC)", "The main procedural law for criminal trials. Governs investigation, arrest, bail, trial, and appeal processes.",
     "Sets forth police powers, magistrate jurisdictions, trial procedures, compounding, and appeals.",
     "Examples: Sec 41 (Arrest without warrant), Sec 437–439 (Bail), Sec 190 (Cognizance)",
     "Primarily procedural; penalties not defined here—sanctions follow the substantive law (e.g., IPC)."),
    ("Indian Evidence Act, 1872", "Regulates the admissibility and relevance of evidence in criminal and civil proceedings.",
     "Defines what is relevant/admissible: confessions, documentary/oral evidence, presumptions, burden of proof.",
     "Examples: Sec 24–30 (Confessions), Sec 61–65B (Documentary & electronic evidence)",
     "No direct penalties; governs evidentiary rules used in trials."),
    ("Bharatiya Nyaya Sanhita, 2023", "Modernized version of the Indian Penal Code with updated provisions on cybercrime, terrorism, etc. (to replace IPC in 2025)",
     "Successor to IPC reorganizing offenses and updating definitions (e.g., mob lynching, organized crime).",
     "Examples: Chapter on offenses against women/children, organized crime",
     "Penalties mapped to updated offense definitions; refer to specific sections for exact terms."),
    ("Bharatiya Nagarik Suraksha Sanhita, 2023", "Updated procedural law for investigation and trials in criminal cases (to replace CrPC in 2025).",
     "Procedural framework replacing CrPC with digital-friendly provisions (e-fir, timelines).",
     "Examples: FIR registration, timelines for investigation",
     "No direct penalties; procedure-only code."),
    ("Bharatiya Sakshya Adhiniyam, 2023", "Modern evidence law including digital evidence and technology-based records (to replace Evidence Act in 2025).",
     "Replaces Evidence Act focusing on electronic records and modern presumptions.",
     "Examples: Provisions analogous to 65B for electronic evidence",
     "No direct penalties; evidentiary statute."),
    ("Prevention of Corruption Act, 1988", "Deals with public servant misconduct and corruption-related offenses.",
     "Criminalizes bribery, undue advantage, criminal misconduct by public servants.",
     "Examples: Sec 7 (Bribery), Sec 13 (Criminal misconduct)",
     "Sec 7: imprisonment 3–7 years and fine; Sec 13: imprisonment up to 7 years and fine (post-amendments)."),
    ("Narcotic Drugs and Psychotropic Substances Act, 1985 (NDPS)", "Regulates the control and prohibition of narcotic drugs and psychotropic substances.",
     "Prohibits production, possession, sale, purchase, transport of narcotics/psychotropics; strict bail.",
     "Examples: Sec 8 (Prohibition), Sec 20–22 (Punishments by quantity)",
     "Penalties vary by quantity: small (up to 1 year) to commercial (10–20 years) plus fine; repeat offenders higher."),
    ("Protection of Children from Sexual Offences (POCSO) Act, 2012", "Protects children from sexual abuse and exploitation.",
     "Defines sexual offenses against children, special courts, child-friendly procedures.",
     "Examples: Sec 3–5 (Penetrative sexual assault/Aggravated), Sec 7–9 (Sexual assault)",
     "Minimum sentences apply: e.g., penetrative assault 10 years to life; aggravated cases may extend to life; fines also."),
    ("Dowry Prohibition Act, 1961", "Prohibits giving, taking, or demanding dowry in marriages.",
     "Covers demand, giving/taking dowry, and related offenses.",
     "Examples: Sec 3 (Penalty for giving/taking), Sec 4 (Demanding dowry)",
     "Sec 3: imprisonment 5 years and fine; Sec 4: imprisonment up to 2 years and fine."),
    ("Domestic Violence Act, 2005", "Protects women from domestic violence and abuse."),
    ("Juvenile Justice (Care and Protection of Children) Act, 2015", "Governs crimes committed by minors and child protection procedures."),
    ("Immoral Traffic (Prevention) Act, 1956", "Deals with trafficking and exploitation for prostitution."),
    ("Information Technology Act, 2000", "Contains cybercrime-related provisions (hacking, identity theft, online fraud).",
     "Establishes legal recognition for e-records/signatures and cyber offenses.",
     "Examples: Sec 66 (Computer-related offenses), Sec 66C/66D (Identity theft/Cheating by personation)",
     "Sec 66: imprisonment up to 3 years or fine; 66C/66D: up to 3 years and fine; varies by offense."),
    ("Prevention of Money Laundering Act, 2002 (PMLA)", "Criminalizes money laundering and allows seizure of property derived from illegal activities.",
     "Targets laundering of proceeds of crime; attachment/confiscation powers.",
     "Examples: Sec 3 (Offense of money-laundering), Sec 4 (Punishment)",
     "Sec 4: rigorous imprisonment 3–7 years (up to 10 for certain offenses) and fine."),
    ("Arms Act, 1959", "Regulates the acquisition, possession, and use of firearms and ammunition.",
     "Licensing and restrictions on arms; offenses for illegal possession, trafficking.",
     "Examples: Sec 3 (License for acquisition), Sec 25 (Punishments)",
     "Sec 25: varied imprisonment terms and fines depending on offense; severe penalties for prohibited arms."),
    ("Unlawful Activities (Prevention) Act, 1967 (UAPA)", "Prevents unlawful and terrorist activities against the integrity and sovereignty of India.",
     "Defines unlawful/terrorist acts, organizations; special procedures for investigation/bail.",
     "Examples: Sec 15 (Terrorist act), Sec 18 (Conspiracy), Schedule (Banned orgs)",
     "Penalties are severe: may include life imprisonment or death depending on offense; stringent bail provisions."),
    ("Sexual Harassment of Women at Workplace Act, 2013", "Protects women from sexual harassment at workplaces.",
     "Mandates Internal Complaints Committee and procedures in workplaces.",
     "Examples: Duties of employer, inquiry process; read with IPC/IT Act",
     "Penalties: compensation to victim; employer non-compliance may attract fines; criminal liability via IPC sections."),
    ("Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989", "Protects members of SC/ST communities from discrimination and violence.",
     "Lists specific atrocities and provides special courts and protection.",
     "Examples: Sec 3 (Offenses of atrocities)",
     "Penalties generally rigorous imprisonment and fine; enhanced penalties for aggravated forms."),
    ("Prevention of Terrorism Act, 2002 (POTA)", "Dealt with terrorism-related offenses (now repealed; replaced by UAPA).",
     "Historic reference; repealed with cases transferred under UAPA.",
     "N/A",
     "N/A"),
]

# ------------------ CIVIL LAW ------------------
CIVIL_ITEMS = [
    ("Code of Civil Procedure, 1908 (CPC)", "The main procedural law for civil cases. Governs filing of suits, appeals, injunctions, and execution of decrees.",
     "Sets civil court structure, pleadings, discovery, trial, decree, and execution.",
     "Examples: Order XXXIX (Injunctions), Order XXI (Execution)",
     "No penalties; procedural statute."),
    ("Indian Contract Act, 1872", "Defines the formation and enforcement of contracts, breach, and remedies.",
     "General principles of contract: offer, acceptance, consideration, void/voidable contracts.",
     "Examples: Sec 10 (Essentials), Sec 73–75 (Damages/compensation)",
     "No criminal penalties; remedies include damages, rescission, specific performance (via Specific Relief Act)."),
    ("Indian Evidence Act, 1872", "Governs admissibility and relevancy of evidence in civil and criminal matters.",
     "Evidentiary rules for civil disputes as well; burden of proof, presumptions.",
     "Examples: Sec 101–114 (Burden, presumptions)",
     "No penalties; evidentiary."),
    ("Limitation Act, 1963", "Specifies the time limits for filing civil suits, appeals, and applications.",
     "Schedules specify limitation periods for different causes of action.",
     "Examples: Articles in the Schedule for suits on contracts, torts, etc.",
     "No penalties; bars remedy if time-barred."),
    ("Specific Relief Act, 1963", "Provides remedies like specific performance, injunctions, and rescission of contracts.",
     "Non-monetary civil remedies; specific enforcement in certain cases; injunctions.",
     "Examples: Sections on specific performance post-2018 amendments",
     "No penalties; civil decrees enforced via CPC."),
    ("Transfer of Property Act, 1882", "Regulates property transfers between living persons (sale, mortgage, lease, gift).",
     "Defines modes of transfer and rights/obligations of parties; mortgages, leases, gifts.",
     "Examples: Sec 105 (Lease), Sec 123 (Gift)",
     "No penalties; invalid transfers void/voidable; remedies civil."),
    ("Indian Easements Act, 1882", "Defines rights like right of way, light, water, and air over another’s property.",
     "Creation/termination of easements; dominant/servient owners.",
     "Examples: Sec 52 (License), customary easements",
     "No penalties; civil enforcement."),
    ("Registration Act, 1908", "Governs registration of documents like property deeds and wills.",
     "Compulsory/optional registration, effects of non-registration.",
     "Examples: Sec 17 (Compulsory registration)",
     "Penalties limited; mainly fees/impounding—criminality via IPC for forgery/fraud if any."),
    ("Indian Succession Act, 1925", "Deals with wills, inheritance, and succession of property after death.",
     "Testamentary/intestate succession for non-Hindus largely; probate, letters of administration.",
     "Examples: Provisions on execution/attestation of wills",
     "No penalties; civil remedies."),
    ("Hindu Marriage Act, 1955", "Governs marriage, divorce, and maintenance among Hindus.",
     "Marriage validity, grounds of divorce, restitution, maintenance.",
     "Examples: Sec 13 (Divorce grounds), Sec 24 (Maintenance pendente lite)",
     "Limited penal consequences via IPC for bigamy; otherwise civil decrees."),
    ("Hindu Succession Act, 1956", "Lays down inheritance rules for Hindus, including daughters’ property rights.",
     "Coparcenary rights equalization (as amended), succession rules.",
     "Examples: Sec 6 (Daughters as coparceners)",
     "No penalties; civil distribution rights."),
    ("Muslim Personal Law (Shariat) Application Act, 1937", "Applies Sharia principles to marriage, succession, and inheritance among Muslims.",
     "Affirms application of Muslim Personal Law in specified matters.",
     "N/A",
     "No penalties in this enabling statute."),
    ("Indian Divorce Act, 1869", "Governs divorce and related matters for Christians in India.",
     "Grounds/procedure for dissolution of marriage, alimony, custody.",
     "Examples: Sections on judicial separation, dissolution",
     "No direct penalties; civil proceedings."),
    ("Special Marriage Act, 1954", "Provides for inter-religious and civil marriages.",
     "Civil marriage registration/solemnization across religions.",
     "Examples: Notice/objection procedure",
     "Penalties limited; bigamy handled via IPC; false statements may attract penalties."),
    ("Guardians and Wards Act, 1890", "Regulates guardianship of minors and their property.",
     "Appointment, duties, and removal of guardians.",
     "N/A",
     "No direct penalties; court-supervised civil remedy."),
    ("Partnership Act, 1932", "Governs formation, duties, and dissolution of partnerships.",
     "Rights, duties, liabilities of partners; dissolution/winding up.",
     "Examples: Sec 48 (Settlement of accounts)",
     "No penalties; civil liabilities/remedies."),
    ("Sale of Goods Act, 1930", "Regulates contracts for sale and purchase of goods.",
     "Formation of contract, conditions/warranties, transfer of property, remedies.",
     "Examples: Sec 12–17 (Conditions/warranties), Sec 55–59 (Remedies)",
     "No penalties; damages/specific performance as per civil law."),
    ("Consumer Protection Act, 2019", "Protects consumer rights and establishes consumer dispute redressal commissions.",
     "Consumer rights, product liability, unfair trade practices, e-commerce rules.",
     "Examples: Central/State/Dist Commissions, product liability",
     "Penalties include fines, imprisonment for adulterated/spurious goods; compensation orders, recall/delivery directions."),
    ("Arbitration and Conciliation Act, 1996", "Provides for resolution of civil disputes through arbitration and mediation.",
     "Arbitration agreements, tribunal powers, awards, enforcement, minimal court intervention.",
     "Examples: Sec 34 (Setting aside award)",
     "No penalties; cost sanctions possible."),
    ("Companies Act, 2013", "Governs formation, management, and winding up of companies (civil/commercial law).",
     "Corporate governance, compliance, directors’ duties, CSR, fraud, SFIO.",
     "Examples: Sec 135 (CSR), Sec 447 (Fraud)",
     "Penalties include fines and imprisonment for various non-compliances; Sec 447 (fraud) severe punishment."),
]

# ------------------ FAMILY LAW ------------------
FAMILY_ITEMS = [
    ("Hindu Marriage Act, 1955", "Covers marriage, divorce, adoption, and maintenance among Hindus."),
    ("Muslim Personal Law (Shariat) Application Act, 1937", "Applies Sharia to marriage, divorce, and inheritance among Muslims."),
    ("Special Marriage Act, 1954", "Allows civil and inter-religious marriages across communities."),
    ("Indian Divorce Act, 1869", "Governs divorce among Christians in India."),
    ("Parsi Marriage and Divorce Act, 1936", "Governs marriage and divorce among Parsis."),
    ("Hindu Adoption and Maintenance Act, 1956", "Regulates adoption and maintenance rights among Hindus."),
    ("Guardians and Wards Act, 1890", "Governs guardianship of minors and their property."),
    ("Dowry Prohibition Act, 1961", "Prohibits giving or taking dowry in marriage."),
    ("Protection of Women from Domestic Violence Act, 2005", "Protects women from domestic abuse and harassment."),
    ("Family Courts Act, 1984", "Establishes family courts for speedy resolution of family disputes."),
    ("Hindu Succession Act, 1956", "Defines inheritance rules for Hindus, including daughters' property rights."),
    ("Muslim Women (Protection of Rights on Divorce) Act, 1986", "Provides rights to Muslim women after divorce."),
    ("Child Marriage Restraint Act, 1929", "Prohibits child marriages and prescribes penalties."),
    ("Prohibition of Child Marriage Act, 2006", "Strengthens penalties and nullifies child marriages."),
    ("Indian Succession Act, 1925", "Governs inheritance and wills for non-Muslims."),
    ("Maintenance and Welfare of Parents and Senior Citizens Act, 2007", "Ensures maintenance and care for elderly parents."),
    ("Juvenile Justice (Care and Protection of Children) Act, 2015", "Provides adoption and care framework for children."),
    ("Maternity Benefit Act, 1961", "Ensures maternity benefits and leave for women employees."),
    ("Pre-Conception and Pre-Natal Diagnostic Techniques Act, 1994", "Prohibits sex selection and protects unborn children."),
    ("The Surrogacy (Regulation) Act, 2021", "Regulates surrogacy procedures and protects rights of surrogate mothers."),
]


# ------------------ EMPLOYMENT LAW ------------------
EMPLOYMENT_ITEMS = [
    ("Factories Act, 1948", "Regulates labor conditions in factories including safety, health, and welfare."),
    ("Minimum Wages Act, 1948", "Ensures minimum wage standards for different occupations."),
    ("Payment of Wages Act, 1936", "Regulates timely payment of wages to employees."),
    ("Payment of Bonus Act, 1965", "Provides for bonus payments to employees based on profits or productivity."),
    ("Payment of Gratuity Act, 1972", "Provides gratuity payments to employees upon termination of employment."),
    ("Employees' Provident Funds and Miscellaneous Provisions Act, 1952", "Provides social security through provident fund contributions."),
    ("Employees’ State Insurance Act, 1948", "Provides medical and cash benefits to employees during sickness and maternity."),
    ("Industrial Disputes Act, 1947", "Provides mechanisms for dispute resolution between employers and employees."),
    ("Trade Unions Act, 1926", "Regulates formation and rights of trade unions."),
    ("Sexual Harassment of Women at Workplace Act, 2013", "Protects women from harassment at workplaces."),
    ("Apprentices Act, 1961", "Regulates training of apprentices in industries."),
    ("Shops and Establishments Act (various states)", "Regulates employment conditions in shops, offices, and commercial establishments."),
    ("Contract Labour (Regulation and Abolition) Act, 1970", "Regulates employment of contract labor."),
    ("Equal Remuneration Act, 1976", "Ensures equal pay for men and women for equal work."),
    ("Inter-State Migrant Workmen Act, 1979", "Protects rights of migrant workers."),
    ("Building and Other Construction Workers Act, 1996", "Regulates employment and safety of construction workers."),
    ("Maternity Benefit Act, 1961", "Provides maternity leave and related benefits."),
    ("Employment Exchanges (Compulsory Notification of Vacancies) Act, 1959", "Requires employers to notify job vacancies."),
    ("Industrial Employment (Standing Orders) Act, 1946", "Defines employment conditions and workers’ conduct."),
    ("Occupational Safety, Health and Working Conditions Code, 2020", "Consolidates labor laws on workplace safety and health."),
]


# ------------------ PROPERTY LAW ------------------
PROPERTY_ITEMS = [
    ("Transfer of Property Act, 1882", "Regulates transfer of property between living persons — sale, mortgage, lease, gift."),
    ("Registration Act, 1908", "Mandates registration of property-related documents."),
    ("Indian Easements Act, 1882", "Defines rights related to use of another’s property (right of way, light, air)."),
    ("Land Acquisition, Rehabilitation and Resettlement Act, 2013", "Ensures fair compensation and rehabilitation for land acquisition."),
    ("Indian Succession Act, 1925", "Governs inheritance and wills."),
    ("Hindu Succession Act, 1956", "Defines inheritance laws for Hindus."),
    ("Real Estate (Regulation and Development) Act, 2016 (RERA)", "Promotes transparency in real estate transactions."),
    ("Benami Transactions (Prohibition) Act, 1988", "Prohibits holding property in someone else’s name to conceal ownership."),
    ("Specific Relief Act, 1963", "Provides remedies like specific performance and injunctions in property matters."),
    ("Indian Stamp Act, 1899", "Regulates stamp duties on property documents."),
    ("Urban Land (Ceiling and Regulation) Act, 1976", "Regulates urban land holdings to prevent concentration."),
    ("Rent Control Acts (State-specific)", "Regulates landlord-tenant relationships and rent disputes."),
    ("Public Premises (Eviction of Unauthorized Occupants) Act, 1971", "Provides for eviction from public premises."),
    ("Land Reforms Acts (various states)", "Redistributes land to eliminate inequality."),
    ("Forest Rights Act, 2006", "Recognizes forest dwellers' rights over forest land."),
    ("Mines and Minerals (Development and Regulation) Act, 1957", "Regulates mining rights and property."),
    ("Indian Trusts Act, 1882", "Governs creation and management of property held in trust."),
    ("Waqf Act, 1995", "Regulates Muslim charitable endowments and property management."),
    ("Ancient Monuments and Archaeological Sites and Remains Act, 1958", "Protects historical property and heritage sites."),
    ("Building and Other Construction Workers (Regulation) Act, 1996", "Regulates construction and building activities on property sites."),
]


# ------------------ CONSUMER LAW ------------------
CONSUMER_ITEMS = [
    ("Consumer Protection Act, 2019", "Protects consumer interests and provides redressal mechanisms."),
    ("Consumer Protection Rules, 2020", "Lays down procedures for consumer disputes and commissions."),
    ("Legal Metrology Act, 2009", "Ensures accurate measurement and labeling of goods."),
    ("Essential Commodities Act, 1955", "Regulates production, supply, and distribution of essential goods."),
    ("Drugs and Cosmetics Act, 1940", "Regulates manufacture and sale of drugs and cosmetics."),
    ("Food Safety and Standards Act, 2006", "Ensures food safety and standards through FSSAI."),
    ("Competition Act, 2002", "Prevents anti-competitive practices and monopolies."),
    ("Bureau of Indian Standards Act, 2016", "Ensures quality certification of goods and services."),
    ("Consumer Protection (E-Commerce) Rules, 2020", "Regulates online shopping platforms and digital marketplaces."),
    ("Weights and Measures (Enforcement) Act, 1985", "Regulates fair measurement in trade and commerce."),
    ("Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954", "Prohibits false advertising of drugs and remedies."),
    ("Cigarettes and Other Tobacco Products Act, 2003", "Regulates sale and advertising of tobacco products."),
    ("Environment (Protection) Act, 1986", "Protects consumers from hazardous environmental conditions."),
    ("Public Liability Insurance Act, 1991", "Ensures compensation for accidents involving hazardous substances."),
    ("Standards of Weights and Measures Act, 1976", "Sets standards for trade and consumer protection."),
    ("Air (Prevention and Control of Pollution) Act, 1981", "Regulates air quality affecting public health."),
    ("Water (Prevention and Control of Pollution) Act, 1974", "Protects consumers’ right to clean water."),
    ("Telecom Regulatory Authority of India Act, 1997", "Ensures fair consumer services in telecom sector."),
    ("Electricity Act, 2003", "Protects consumer rights in electricity supply and billing."),
    ("Insolvency and Bankruptcy Code, 2016", "Protects consumers in financial transactions and recoveries."),
]


# ------------------ CYBER LAW ------------------
CYBER_ITEMS = [
    ("Information Technology Act, 2000", "Primary law governing cyber activities, e-documents, and offenses."),
    ("Information Technology (Amendment) Act, 2008", "Covers cyber terrorism, phishing, identity theft, and digital fraud."),
    ("Digital Personal Data Protection Act, 2023", "Regulates collection, storage, and use of personal data."),
    ("Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021", "Regulates social media and digital content platforms."),
    ("CERT-In Rules, 2013", "Establishes the Indian Computer Emergency Response Team for cybersecurity incidents."),
    ("National Cyber Security Policy, 2013", "Framework for protecting India’s cyberspace."),
    ("Indian Evidence Act, 1872 (Sections 65A & 65B)", "Recognizes electronic records as admissible evidence."),
    ("Information Technology (Reasonable Security Practices) Rules, 2011", "Mandates companies to safeguard user data."),
    ("IT (Blocking Rules), 2009", "Empowers the government to block illegal online content."),
    ("Cyber Appellate Tribunal Rules, 2003", "Establishes tribunal to hear cyber law appeals."),
    ("Electronic Governance Rules, 2011", "Facilitates electronic submission of government services."),
    ("Digital Signature Rules, 2015", "Defines procedure for using electronic signatures."),
    ("Critical Information Infrastructure Protection Rules, 2018", "Protects digital systems vital to national security."),
    ("Indian Penal Code Sections (354D, 420, 499)", "Punishes cyberstalking, fraud, and defamation online."),
    ("National Investigation Agency Act, 2008", "Empowers NIA to investigate cyber terrorism."),
    ("Protection of Children from Sexual Offences Act, 2012", "Covers online child exploitation and cyber grooming."),
    ("Telegraph Act, 1885 (with IT Amendments)", "Regulates interception and monitoring of communication."),
    ("Payment and Settlement Systems Act, 2007", "Regulates digital payments and online transactions."),
    ("E-Records and Retention Rules, 2009", "Defines storage and retention of digital records."),
    ("Cybersecurity Assurance Framework, 2019", "Guidelines for assessing cybersecurity preparedness."),
]


ITEMS_BY_SLUG['ipc'] = CRIMINAL_ITEMS
ITEMS_BY_SLUG['civil'] = CIVIL_ITEMS
ITEMS_BY_SLUG['family'] = FAMILY_ITEMS
ITEMS_BY_SLUG['labour'] = EMPLOYMENT_ITEMS
ITEMS_BY_SLUG['property'] = PROPERTY_ITEMS
ITEMS_BY_SLUG['consumer'] = CONSUMER_ITEMS
ITEMS_BY_SLUG['cyber'] = CYBER_ITEMS


class Command(BaseCommand):
    help = "Seed the five-level law hierarchy (Domain → Category → Law → Section → SectionDetail)."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("Seeding law hierarchy..."))

        for dc in DOMAIN_CATEGORIES:
            domain, _ = LawDomain.objects.get_or_create(
                domain_name=dc['domain_name'],
                defaults={
                    'description': dc['description'],
                    'display_order': dc['display_order'],
                },
            )

            for cat_data in dc['categories']:
                category, _ = LawCategory.objects.get_or_create(
                    slug=cat_data['slug'],
                    defaults={
                        'domain': domain,
                        'category_name': cat_data['category_name'],
                        'description': cat_data['description'],
                    },
                )

                items = ITEMS_BY_SLUG.get(cat_data['slug'], [])
                for item in items:
                    title = item[0]
                    summary = item[1] if len(item) > 1 else ''
                    full_text = item[2] if len(item) > 2 else ''
                    examples = item[3] if len(item) > 3 else ''
                    penalties = item[4] if len(item) > 4 else DEFAULT_PENALTIES.get(cat_data['slug'], '')

                    law, law_created = Law.objects.get_or_create(
                        category=category,
                        law_title=title,
                        defaults={'summary': summary},
                    )

                    section, sec_created = LawSection.objects.get_or_create(
                        law=law,
                        section_number='General',
                        defaults={
                            'section_title': f'{title} — Overview',
                            'section_text': full_text or f'{title}: {summary}',
                        },
                    )

                    if sec_created or not hasattr(section, 'detail'):
                        LawSectionDetail.objects.get_or_create(
                            section=section,
                            defaults={
                                'simplified_explanation': summary,
                                'offence_description': full_text or summary,
                                'imprisonment_term': '',
                                'fine_amount': '',
                                'compensation': '',
                                'bailable_status': '',
                                'cognizable_status': '',
                                'example_scenario': examples,
                            },
                        )

                    tag = 'created' if law_created else 'exists'
                    self.stdout.write(
                        (self.style.SUCCESS if law_created else self.style.WARNING)(
                            f"  [{cat_data['slug']}] {tag}: {title}"
                        )
                    )

                self.stdout.write(
                    self.style.SUCCESS(f"  → {category.category_name}: {len(items)} laws processed")
                )

        self.stdout.write(self.style.SUCCESS("✅ Seeding completed successfully."))
