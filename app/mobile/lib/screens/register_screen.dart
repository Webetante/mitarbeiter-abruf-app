import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/branch.dart';
import '../services/auth_service.dart';
import '../services/branch_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final nameController = TextEditingController();
  final phoneController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  bool isLoading = false;
  bool isLoadingBranches = true;

  List<Branch> branches = [];
  String? selectedBranchId;
  String? branchLoadError;

  bool get _supabaseConfigured {
    const url = String.fromEnvironment('SUPABASE_URL');
    const key = String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY');
    return url.isNotEmpty && key.isNotEmpty;
  }

  @override
  void initState() {
    super.initState();
    _loadBranches();
  }

  @override
  void dispose() {
    nameController.dispose();
    phoneController.dispose();
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  Future<void> _loadBranches() async {
    if (!_supabaseConfigured) {
      setState(() {
        isLoadingBranches = false;
        branchLoadError = 'Supabase ist noch nicht konfiguriert.';
      });
      return;
    }

    try {
      final branchService = BranchService(Supabase.instance.client);
      final result = await branchService.fetchActiveBranches();

      if (!mounted) return;

      setState(() {
        branches = result;
        selectedBranchId = result.isNotEmpty ? result.first.id : null;
        isLoadingBranches = false;
      });
    } catch (error) {
      if (!mounted) return;

      setState(() {
        branchLoadError = error.toString();
        isLoadingBranches = false;
      });
    }
  }

  Future<void> _register() async {
    if (selectedBranchId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Bitte eine Filiale auswählen.')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      final authService = AuthService(Supabase.instance.client);

      await authService.signUpEmployee(
        fullName: nameController.text,
        phone: phoneController.text,
        email: emailController.text,
        password: passwordController.text,
        branchId: selectedBranchId,
      );

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Registrierung erfolgreich. Bitte E-Mail bestätigen.'),
        ),
      );

      Navigator.of(context).pop();
    } catch (error) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registrierung fehlgeschlagen: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => isLoading = false);
      }
    }
  }

  Widget _buildBranchField() {
    if (isLoadingBranches) {
      return const Center(child: CircularProgressIndicator());
    }

    if (branchLoadError != null) {
      return Text(
        'Filialen konnten nicht geladen werden: $branchLoadError',
        style: const TextStyle(color: Colors.orange),
      );
    }

    if (branches.isEmpty) {
      return const Text(
        'Es wurden noch keine aktiven Filialen gefunden.',
        style: TextStyle(color: Colors.orange),
      );
    }

    return DropdownButtonFormField<String>(
      initialValue: selectedBranchId,
      decoration: const InputDecoration(
        labelText: 'Filiale',
        border: OutlineInputBorder(),
      ),
      items: branches
          .map(
            (branch) => DropdownMenuItem<String>(
              value: branch.id,
              child: Text(branch.displayName),
            ),
          )
          .toList(),
      onChanged: isLoading
          ? null
          : (value) {
              setState(() => selectedBranchId = value);
            },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrieren'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 480),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: 24),
                  const Icon(Icons.person_add_alt_1, size: 72),
                  const SizedBox(height: 24),
                  const Text(
                    'Mitarbeiter registrieren',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 32),
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Vollständiger Name',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: phoneController,
                    keyboardType: TextInputType.phone,
                    decoration: const InputDecoration(
                      labelText: 'Telefonnummer',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: emailController,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'E-Mail',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Passwort',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildBranchField(),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: isLoading ? null : _register,
                    child: isLoading
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Registrieren'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
