from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from accounts.models import DoctorProfile
from blog.models import Article

User = get_user_model()

class Command(BaseCommand):
    help = "Seeds the database with admin, verified/unverified doctors, clients, and articles."

    def handle(self, *args, **options):
        self.stdout.write("Clearing existing data...")
        Article.objects.all().delete()
        DoctorProfile.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write("Creating users...")

        # 1. Admin User
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@health02.com',
            password='adminpass',
            role=User.ADMIN,
            first_name='System',
            last_name='Admin'
        )
        self.stdout.write("Created Admin: admin / adminpass")

        # 2. Verified Doctor User
        dr_verified = User.objects.create_user(
            username='dr_verified',
            email='dr.verified@health02.com',
            password='docpass',
            role=User.DOCTOR,
            first_name='Verified',
            last_name='Doctor',
            phone='+1-555-0199'
        )
        # Create and verify profile
        DoctorProfile.objects.create(
            user=dr_verified,
            specialization='Cardiology',
            registration_number='NMC-98765',
            is_verified=True,
            verified_by=admin_user,
            verified_at=timezone.now()
        )
        self.stdout.write("Created Verified Doctor: dr_verified / docpass")

        # 3. Unverified Doctor User
        dr_unverified = User.objects.create_user(
            username='dr_unverified',
            email='dr.unverified@health02.com',
            password='docpass',
            role=User.DOCTOR,
            first_name='Unverified',
            last_name='Doctor',
            phone='+1-555-0188'
        )
        DoctorProfile.objects.create(
            user=dr_unverified,
            specialization='Pediatrics',
            registration_number='NMC-12345',
            is_verified=False
        )
        self.stdout.write("Created Unverified Doctor: dr_unverified / docpass")

        # 2b. Verified Doctor User: Priya Sharma
        dr_priya = User.objects.create_user(
            username='dr_priya',
            email='dr.priya@health02.com',
            password='docpass',
            role=User.DOCTOR,
            first_name='Priya',
            last_name='Sharma',
            phone='+91 98111 22233'
        )
        DoctorProfile.objects.create(
            user=dr_priya,
            specialization='Dermatology',
            registration_number='NMC-54321',
            is_verified=True,
            verified_by=admin_user,
            verified_at=timezone.now()
        )
        self.stdout.write("Created Verified Doctor Priya Sharma: dr_priya / docpass")

        # 2c. Verified Doctor User: Rohan Mehra
        dr_rohan = User.objects.create_user(
            username='dr_rohan',
            email='dr.rohan@health02.com',
            password='docpass',
            role=User.DOCTOR,
            first_name='Rohan',
            last_name='Mehra',
            phone='+91 99999 88888'
        )
        DoctorProfile.objects.create(
            user=dr_rohan,
            specialization='Neurology',
            registration_number='NMC-11111',
            is_verified=True,
            verified_by=admin_user,
            verified_at=timezone.now()
        )
        self.stdout.write("Created Verified Doctor Rohan Mehra: dr_rohan / docpass")

        # 4. Clients
        client_1 = User.objects.create_user(
            username='client_1',
            email='client1@health02.com',
            password='clientpass',
            role=User.CLIENT,
            first_name='John',
            last_name='Doe',
            phone='+1-555-0100'
        )
        client_2 = User.objects.create_user(
            username='client_2',
            email='client2@health02.com',
            password='clientpass',
            role=User.CLIENT,
            first_name='Jane',
            last_name='Smith',
            phone='+1-555-0101'
        )
        self.stdout.write("Created Clients: client_1 / clientpass, client_2 / clientpass")

        self.stdout.write("Creating articles...")


        # Article 1: Aligned Cardiology Article
        Article.objects.create(
            title='The Future of Cardiology: AI and Wearable Tech',
            summary='Explore how AI-integrated smartwatches are shifting cardiology from reactive treatments to preventive care blueprints.',
            content='Clinical trials are demonstrating extraordinary accuracy in detecting irregular heart patterns weeks in advance. By mapping real-time photoplethysmography (PPG) waves from standard commercial wearables directly to deep-learning models, researchers can flag subclinical atrial fibrillation. \n\n### Why Wearables Matter\nModern patients are actively deploying custom health monitoring blueprints to coordinate with their clinical cardiologists. This permits longitudinal tracking outside traditional hospital settings, saving diagnostic effort and capturing rare paroxysmal events that would be missed in a standard 12-lead ECG session.\n\n### A Partnership with Specialists\nWhile algorithms offer high sensitivity, true clinical precision relies on specialist verification. A doctor\'s interpretation of the longitudinal charts guarantees that medical history, stress factors, and specific cardiac parameters are properly accounted for.',
            cover_image_url='https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
            tags='Cardiology,Technology,Self-Care',
            author=dr_verified,
            status=Article.PUBLISHED
        )

        # Article 2: Aligned Dermatology Article by Priya
        Article.objects.create(
            title='Clinical Guide: Managing Seasonal Eczema Flares',
            summary='Evidence-based strategies for maintaining epidermal moisture barriers during extreme Indian summers.',
            content='With seasonal shifts in humidity and high heat index levels, patients with atopic dermatitis face recurrent epidermal micro-fissuring.\n\n### The Golden Rule of Hydration\nApply thick ceramide-based emollients within three minutes of bathing. This locks in interstitial water molecules before evaporation occurs.\n\n### Ingredients to Avoid\nAvoid soaps containing sodium lauryl sulfate (SLS), which strip the lipid bilayer. Opt for clinical syndet bars instead. If erythema persists, consult a dermatologist for low-potency topical immunomodulators.',
            cover_image_url='https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800',
            tags='Dermatology,Summer Care',
            author=dr_priya,
            status=Article.PUBLISHED
        )

        # Article 3: Aligned Pediatrics Draft by Unverified
        Article.objects.create(
            title='[Draft] Recent Advances in Pediatric Immunization Protocols',
            summary='A comprehensive medical review of next-generation combination vaccines and secondary pediatric defense strategies.',
            content='This draft explores combinations that minimize pediatric injection distress. Reductions in structural adjuvants are proving equally immunogenic.',
            cover_image_url='https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
            tags='Pediatrics,Vaccines',
            author=dr_unverified,
            status=Article.DRAFT
        )

        # Article 4: Published by Verified Doctor
        Article.objects.create(
            title='Understanding Heart Health',
            summary='A brief overview of how to maintain a healthy cardiovascular system.',
            content='Cardiovascular disease is a leading cause of death globally. Staying active, maintaining a balanced diet, and undergoing routine check-ups are key safeguards to heart wellness.',
            cover_image_url='https://images.unsplash.com/photo-1505751172876-fa1923c5c528',
            tags='heart,cardiology,health',
            author=dr_verified,
            status=Article.PUBLISHED
        )

        # Article 5: Published by Verified Doctor
        Article.objects.create(
            title='Common Childhood Illnesses',
            summary='Guide to identifying and handling common pediatric symptoms.',
            content='From standard seasonal fevers to viral rashes, childhood illnesses are frequent. Knowing when to self-manage and when to call a pediatrician is critical for early recovery.',
            cover_image_url='https://images.unsplash.com/photo-1581594693702-fbdc51b2763b',
            tags='pediatrics,child-health,parenting',
            author=dr_verified,
            status=Article.PUBLISHED
        )

        # Article 6: Draft by Verified Doctor
        Article.objects.create(
            title='Drafting Advanced Cardiology Protocols',
            summary='Cardiology guidelines draft.',
            content='This draft outlines a set of recommendations for high-risk patients. These protocols include aggressive cholesterol-lowering targets and early invasive therapy criteria.',
            cover_image_url='https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
            tags='draft,cardiology,protocol',
            author=dr_verified,
            status=Article.DRAFT
        )

        # Article 7: Draft by Unverified Doctor
        Article.objects.create(
            title='Unverified Doctor Notes',
            summary='A draft notes article.',
            content='Internal study notes detailing motor developmental milestones in children aged 12 to 24 months.',
            cover_image_url='https://images.unsplash.com/photo-1559839734-2b71ea197ec2',
            tags='notes,milestones,draft',
            author=dr_unverified,
            status=Article.DRAFT
        )

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
